import { dbPool } from "../../config/database.js";
import type {
  AlertsQuery,
  CompaniesQuery,
  CompanyControlQuery,
  CompanyDevicesQuery,
  DeviceControlQuery,
  DocumentsSummaryQuery,
  DevicesQuery,
  FolioRangesQuery,
  FoliosControlQuery
} from "./support.schemas.js";

export type PaginatedResult<TItem> = {
  items: TItem[];
  pagination: {
    limit: number;
    offset: number;
    total?: number;
  };
};

export type DocumentsSummaryResult = {
  filters: {
    tenantId?: string;
    rut?: number;
  };
  totals: {
    documents: number;
    companies: number;
    devices: number;
    documentTypes: number;
  };
  monthly: Array<{
    period: string;
    documents: number;
  }>;
  byDocumentType: Array<{
    documentType: number;
    documents: number;
  }>;
};

const alertsBaseSql = `
  WITH alerts AS (
    SELECT
      tenant_id,
      tenant_name,
      rut,
      empresa_name,
      'EMPRESA'::text AS source,
      nivel_alerta_emision::text AS severity,
      CASE
        WHEN nivel_alerta_emision = 'SIN_EMISION' THEN 'Empresa sin emision'
        ELSE 'Empresa con alerta de emision'
      END AS title,
      concat(
        'Docs 2026: ', documentos_emitidos_2026::text,
        '. Dias sin emitir: ', coalesce(dias_sin_emitir::text, 'sin dato')
      ) AS detail,
      NULL::text AS entity_id,
      NULL::integer AS document_type,
      documentos_emitidos_2026::numeric AS metric_value,
      dias_sin_emitir::numeric AS metric_secondary,
      ultima_emision::text AS reference_date
    FROM rr_gestion_soporte.empresa_control_resumen
    WHERE nivel_alerta_emision <> 'OK'

    UNION ALL

    SELECT
      tenant_id,
      tenant_name,
      rut,
      empresa_name,
      'DEVICE'::text AS source,
      CASE
        WHEN nivel_alerta_emision <> 'OK' THEN nivel_alerta_emision::text
        ELSE 'WARNING'
      END AS severity,
      CASE
        WHEN nivel_alerta_emision <> 'OK' THEN 'Device con alerta de emision'
        ELSE 'Device con alerta de consistencia'
      END AS title,
      concat(
        'Device: ', coalesce(device_name, device_id),
        '. Consistencia: ', alerta_consistencia,
        '. Docs 2026: ', documentos_emitidos_2026::text
      ) AS detail,
      device_id::text AS entity_id,
      NULL::integer AS document_type,
      documentos_emitidos_2026::numeric AS metric_value,
      dias_sin_emitir::numeric AS metric_secondary,
      ultima_emision::text AS reference_date
    FROM rr_gestion_soporte.device_control_resumen
    WHERE nivel_alerta_emision <> 'OK'
       OR alerta_consistencia <> 'OK'

    UNION ALL

    SELECT
      tenant_id,
      tenant_name,
      rut,
      empresa_name,
      'FOLIOS'::text AS source,
      nivel_alerta_folios::text AS severity,
      'Folios requieren revision' AS title,
      concat(
        'Tipo DTE: ', document_type::text,
        '. Disponibles: ', folios_disponibles::text,
        '. Diferencia solicitados/rango: ', diferencia_solicitado_rango::text
      ) AS detail,
      NULL::text AS entity_id,
      document_type::integer AS document_type,
      folios_disponibles::numeric AS metric_value,
      diferencia_solicitado_rango::numeric AS metric_secondary,
      ultima_emision::text AS reference_date
    FROM rr_gestion_soporte.folios_control_resumen
    WHERE nivel_alerta_folios <> 'OK'

    UNION ALL

    SELECT
      tenant_id,
      tenant_name,
      rut,
      empresa_name,
      'AGOTAMIENTO'::text AS source,
      nivel_alerta_agotamiento::text AS severity,
      'Proyeccion de agotamiento' AS title,
      concat(
        'Tipo DTE: ', document_type::text,
        '. Disponibles: ', folios_disponibles::text,
        '. Dias 30d: ', coalesce(dias_hasta_agotar_30d::text, 'sin base'),
        '. Dias 90d: ', coalesce(dias_hasta_agotar_90d::text, 'sin base')
      ) AS detail,
      NULL::text AS entity_id,
      document_type::integer AS document_type,
      folios_disponibles::numeric AS metric_value,
      coalesce(dias_hasta_agotar_30d, dias_hasta_agotar_90d)::numeric AS metric_secondary,
      NULL::text AS reference_date
    FROM rr_gestion_soporte.folios_proyeccion_agotamiento
    WHERE nivel_alerta_agotamiento <> 'OK'
  )
`;

const addFilter = (clauses: string[], values: unknown[], sql: string, value: unknown) => {
  if (value === undefined) {
    return;
  }

  values.push(value);
  clauses.push(sql.replace("?", `$${values.length}`));
};

const appendPagination = (values: unknown[], limit: number, offset: number) => {
  values.push(limit);
  const limitPlaceholder = `$${values.length}`;
  values.push(offset);
  const offsetPlaceholder = `$${values.length}`;

  return `LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`;
};

export const listCompanies = async (
  query: CompaniesQuery
): Promise<PaginatedResult<Record<string, unknown>>> => {
  const clauses: string[] = [];
  const values: unknown[] = [];

  addFilter(clauses, values, "tenant_id = ?", query.tenantId);
  addFilter(clauses, values, "empresa_status = ?", query.status);

  if (query.search) {
    values.push(`%${query.search}%`, `%${query.search}%`, `%${query.search}%`);
    clauses.push(
      `(empresa_name ILIKE $${values.length - 2} OR rut::text ILIKE $${values.length - 1} OR tenant_name ILIKE $${values.length})`
    );
  }

  const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const paginationSql = appendPagination(values, query.limit, query.offset);

  const result = await dbPool.query(
    `SELECT *
     FROM rr_gestion_soporte.empresas_resumen
     ${whereSql}
     ORDER BY empresa_name ASC
     ${paginationSql}`,
    values
  );

  const items = result.rows.map((row) => ({
    ...row,
    dias_desde_creacion:
      row.dias_desde_creacion === null ? null : Number(row.dias_desde_creacion),
    dias_sin_emitir: row.dias_sin_emitir === null ? null : Number(row.dias_sin_emitir),
    documentos_emitidos_2026: Number(row.documentos_emitidos_2026),
    periodos_con_emision: Number(row.periodos_con_emision),
    promedio_documentos_periodo: Number(row.promedio_documentos_periodo),
    total_valor_documentos: Number(row.total_valor_documentos)
  }));

  return {
    items,
    pagination: {
      limit: query.limit,
      offset: query.offset
    }
  };
};

export const listDevices = async (
  query: DevicesQuery
): Promise<PaginatedResult<Record<string, unknown>>> => {
  const clauses: string[] = [];
  const values: unknown[] = [];

  addFilter(clauses, values, "tenant_id = ?", query.tenantId);
  addFilter(clauses, values, "device_status = ?", query.status);

  if (query.search) {
    values.push(`%${query.search}%`, `%${query.search}%`, `%${query.search}%`);
    clauses.push(
      `(device_name ILIKE $${values.length - 2} OR device_id ILIKE $${values.length - 1} OR local ILIKE $${values.length})`
    );
  }

  const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const paginationSql = appendPagination(values, query.limit, query.offset);

  const result = await dbPool.query(
    `SELECT *
     FROM rr_gestion_soporte.dispositivos_resumen
     ${whereSql}
     ORDER BY device_name ASC NULLS LAST, device_id ASC
     ${paginationSql}`,
    values
  );

  return {
    items: result.rows,
    pagination: {
      limit: query.limit,
      offset: query.offset
    }
  };
};

export const listCompanyDevices = async (
  query: CompanyDevicesQuery
): Promise<PaginatedResult<Record<string, unknown>>> => {
  const clauses: string[] = [];
  const values: unknown[] = [];

  addFilter(clauses, values, "tenant_id = ?", query.tenantId);
  addFilter(clauses, values, "rut = ?", query.rut);
  addFilter(clauses, values, "device_status = ?", query.status);

  if (query.search) {
    values.push(`%${query.search}%`, `%${query.search}%`, `%${query.search}%`, `%${query.search}%`);
    clauses.push(
      `(empresa_name ILIKE $${values.length - 3} OR rut::text ILIKE $${values.length - 2} OR device_name ILIKE $${values.length - 1} OR device_id ILIKE $${values.length})`
    );
  }

  const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const paginationSql = appendPagination(values, query.limit, query.offset);

  const result = await dbPool.query(
    `SELECT *
     FROM rr_gestion_soporte.empresa_dispositivo_resumen
     ${whereSql}
     ORDER BY empresa_name ASC, device_name ASC NULLS LAST
     ${paginationSql}`,
    values
  );

  return {
    items: result.rows,
    pagination: {
      limit: query.limit,
      offset: query.offset
    }
  };
};

export const listCompanyControl = async (
  query: CompanyControlQuery
): Promise<PaginatedResult<Record<string, unknown>>> => {
  const clauses: string[] = [];
  const values: unknown[] = [];

  addFilter(clauses, values, "tenant_id = ?", query.tenantId);
  addFilter(clauses, values, "rut = ?", query.rut);
  addFilter(clauses, values, "empresa_status = ?", query.status);
  addFilter(clauses, values, "nivel_alerta_emision = ?", query.alert);

  if (query.search) {
    values.push(`%${query.search}%`, `%${query.search}%`, `%${query.search}%`);
    clauses.push(
      `(empresa_name ILIKE $${values.length - 2} OR rut::text ILIKE $${values.length - 1} OR tenant_name ILIKE $${values.length})`
    );
  }

  const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const countValues = [...values];
  const paginationSql = appendPagination(values, query.limit, query.offset);

  const [result, countResult] = await Promise.all([
    dbPool.query(
      `SELECT *
       FROM rr_gestion_soporte.empresa_control_resumen
       ${whereSql}
       ORDER BY
         CASE nivel_alerta_emision
           WHEN 'URGENTE' THEN 1
           WHEN 'SIN_EMISION' THEN 2
           WHEN 'WARNING' THEN 3
           ELSE 4
         END,
         dias_sin_emitir DESC NULLS FIRST,
         empresa_name ASC
       ${paginationSql}`,
      values
    ),
    dbPool.query(
      `SELECT count(*)::bigint AS total
       FROM rr_gestion_soporte.empresa_control_resumen
       ${whereSql}`,
      countValues
    )
  ]);

  return {
    items: result.rows,
    pagination: {
      limit: query.limit,
      offset: query.offset,
      total: Number(countResult.rows[0]?.total ?? 0)
    }
  };
};

export const listDeviceControl = async (
  query: DeviceControlQuery
): Promise<PaginatedResult<Record<string, unknown>>> => {
  const clauses: string[] = [];
  const values: unknown[] = [];

  addFilter(clauses, values, "tenant_id = ?", query.tenantId);
  addFilter(clauses, values, "rut = ?", query.rut);
  addFilter(clauses, values, "device_status = ?", query.status);
  addFilter(clauses, values, "nivel_alerta_emision = ?", query.alert);
  addFilter(clauses, values, "alerta_consistencia = ?", query.consistency);

  if (query.search) {
    values.push(
      `%${query.search}%`,
      `%${query.search}%`,
      `%${query.search}%`,
      `%${query.search}%`,
      `%${query.search}%`
    );
    clauses.push(
      `(empresa_name ILIKE $${values.length - 4} OR rut::text ILIKE $${values.length - 3} OR device_name ILIKE $${values.length - 2} OR device_id ILIKE $${values.length - 1} OR tenant_name ILIKE $${values.length})`
    );
  }

  const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const countValues = [...values];
  const paginationSql = appendPagination(values, query.limit, query.offset);

  const [result, countResult] = await Promise.all([
    dbPool.query(
      `SELECT *
       FROM rr_gestion_soporte.device_control_resumen
       ${whereSql}
       ORDER BY
         CASE nivel_alerta_emision
           WHEN 'URGENTE' THEN 1
           WHEN 'SIN_EMISION' THEN 2
           WHEN 'WARNING' THEN 3
           ELSE 4
         END,
         CASE alerta_consistencia
           WHEN 'ACTIVO_SIN_EMISION' THEN 1
           WHEN 'ACTIVO_SIN_EMISION_RECIENTE' THEN 2
           WHEN 'NO_ACTIVO_CON_EMISION' THEN 3
           ELSE 4
         END,
         dias_sin_emitir DESC NULLS FIRST,
         empresa_name ASC NULLS LAST,
         device_name ASC NULLS LAST
       ${paginationSql}`,
      values
    ),
    dbPool.query(
      `SELECT count(*)::bigint AS total
       FROM rr_gestion_soporte.device_control_resumen
       ${whereSql}`,
      countValues
    )
  ]);

  return {
    items: result.rows,
    pagination: {
      limit: query.limit,
      offset: query.offset,
      total: Number(countResult.rows[0]?.total ?? 0)
    }
  };
};

export const listFoliosControl = async (
  query: FoliosControlQuery
): Promise<PaginatedResult<Record<string, unknown>>> => {
  const clauses: string[] = [];
  const values: unknown[] = [];

  addFilter(clauses, values, "tenant_id = ?", query.tenantId);
  addFilter(clauses, values, "rut = ?", query.rut);
  addFilter(clauses, values, "document_type = ?", query.documentType);
  addFilter(clauses, values, "nivel_alerta_folios = ?", query.alert);

  if (query.search) {
    values.push(`%${query.search}%`, `%${query.search}%`, `%${query.search}%`);
    clauses.push(
      `(empresa_name ILIKE $${values.length - 2} OR rut::text ILIKE $${values.length - 1} OR tenant_name ILIKE $${values.length})`
    );
  }

  const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const countValues = [...values];
  const paginationSql = appendPagination(values, query.limit, query.offset);

  const [result, countResult] = await Promise.all([
    dbPool.query(
      `SELECT *
       FROM rr_gestion_soporte.folios_control_resumen
       ${whereSql}
       ORDER BY
         CASE nivel_alerta_folios
           WHEN 'REVISION_DATOS' THEN 1
           WHEN 'SIN_FOLIOS' THEN 2
           WHEN 'URGENTE' THEN 3
           WHEN 'WARNING' THEN 4
           ELSE 5
         END,
         abs(diferencia_solicitado_rango) DESC,
         folios_disponibles ASC,
         empresa_name ASC NULLS LAST,
         document_type ASC
       ${paginationSql}`,
      values
    ),
    dbPool.query(
      `SELECT count(*)::bigint AS total
       FROM rr_gestion_soporte.folios_control_resumen
       ${whereSql}`,
      countValues
    )
  ]);

  const numericFields = [
    "rut",
    "document_type",
    "caf_count",
    "folios_otorgados",
    "folio_min",
    "folio_max",
    "rangos_disponibles",
    "folios_disponibles",
    "folio_disponible_min",
    "folio_disponible_max",
    "cargas_historial",
    "folios_entregados_por_rango",
    "folios_solicitados",
    "diferencia_solicitado_rango",
    "devices_con_revision_historial",
    "documentos_emitidos_2026",
    "devices_con_emision",
    "dias_sin_emitir"
  ];

  const items = result.rows.map((row) => {
    const item = { ...row };

    numericFields.forEach((field) => {
      if (item[field] !== null && item[field] !== undefined) {
        item[field] = Number(item[field]);
      }
    });

    return item;
  });

  return {
    items,
    pagination: {
      limit: query.limit,
      offset: query.offset,
      total: Number(countResult.rows[0]?.total ?? 0)
    }
  };
};

export const listFolioRanges = async (
  query: FolioRangesQuery
): Promise<PaginatedResult<Record<string, unknown>>> => {
  const clauses: string[] = [];
  const values: unknown[] = [];

  addFilter(clauses, values, "tenant_id = ?", query.tenantId);
  addFilter(clauses, values, "rut = ?", query.rut);
  addFilter(clauses, values, "document_type = ?", query.documentType);
  addFilter(clauses, values, "estado_operativo_rango = ?", query.estadoOperativo);
  addFilter(clauses, values, "estado_rango = ?", query.estadoRango);
  addFilter(clauses, values, "clasificacion_temporal = ?", query.clasificacionTemporal);

  if (query.search) {
    values.push(`%${query.search}%`, `%${query.search}%`, `%${query.search}%`);
    clauses.push(
      `(empresa_name ILIKE $${values.length - 2} OR rut::text ILIKE $${values.length - 1} OR tenant_name ILIKE $${values.length})`
    );
  }

  const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const countValues = [...values];
  const paginationSql = appendPagination(values, query.limit, query.offset);

  const [result, countResult] = await Promise.all([
    dbPool.query(
      `SELECT *
       FROM rr_gestion_soporte.folios_rangos_clasificados_detalle
       ${whereSql}
       ORDER BY
         CASE estado_operativo_rango
           WHEN 'CADUCADO_CANDIDATO' THEN 1
           WHEN 'POR_OCUPAR' THEN 2
           WHEN 'EN_USO' THEN 3
           WHEN 'REVISION_DATOS' THEN 4
           WHEN 'AGOTADO' THEN 5
           ELSE 9
         END,
         CASE clasificacion_temporal
           WHEN 'RANGOANTERIOR' THEN 1
           WHEN 'RANGOACTUAL' THEN 2
           WHEN 'RANGOFUTURO' THEN 3
           ELSE 9
         END,
         lost_folios DESC,
         total_documentos_desocupados DESC,
         empresa_name ASC NULLS LAST,
         document_type ASC,
         folio_ini ASC
       ${paginationSql}`,
      values
    ),
    dbPool.query(
      `SELECT count(*)::bigint AS total
       FROM rr_gestion_soporte.folios_rangos_clasificados_detalle
       ${whereSql}`,
      countValues
    )
  ]);

  const numericFields = [
    "rut",
    "document_type",
    "cafserial",
    "folio_ini",
    "folio_fin",
    "total_rango",
    "total_ocupado",
    "total_documentos_desocupados",
    "primer_folio_emitido",
    "folio_mayor",
    "folio_mayor_global",
    "lost_folios"
  ];

  const items = result.rows.map((row) => {
    const item = { ...row };

    numericFields.forEach((field) => {
      if (item[field] !== null && item[field] !== undefined) {
        item[field] = Number(item[field]);
      }
    });

    return item;
  });

  return {
    items,
    pagination: {
      limit: query.limit,
      offset: query.offset,
      total: Number(countResult.rows[0]?.total ?? 0)
    }
  };
};

export const listAlerts = async (
  query: AlertsQuery
): Promise<PaginatedResult<Record<string, unknown>>> => {
  const clauses: string[] = [];
  const values: unknown[] = [];

  addFilter(clauses, values, "tenant_id = ?", query.tenantId);
  addFilter(clauses, values, "rut = ?", query.rut);
  addFilter(clauses, values, "severity = ?", query.severity);
  addFilter(clauses, values, "source = ?", query.source);

  if (query.search) {
    values.push(
      `%${query.search}%`,
      `%${query.search}%`,
      `%${query.search}%`,
      `%${query.search}%`,
      `%${query.search}%`
    );
    clauses.push(
      `(empresa_name ILIKE $${values.length - 4} OR rut::text ILIKE $${values.length - 3} OR tenant_name ILIKE $${values.length - 2} OR coalesce(entity_id, '') ILIKE $${values.length - 1} OR detail ILIKE $${values.length})`
    );
  }

  const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const countValues = [...values];
  const paginationSql = appendPagination(values, query.limit, query.offset);

  const orderSql = `
    ORDER BY
      CASE severity
        WHEN 'REVISION_DATOS' THEN 1
        WHEN 'SIN_FOLIOS' THEN 2
        WHEN 'URGENTE' THEN 3
        WHEN 'SIN_EMISION' THEN 4
        WHEN 'WARNING' THEN 5
        WHEN 'SIN_BASE_ESTIMACION' THEN 6
        ELSE 9
      END,
      metric_secondary DESC NULLS LAST,
      metric_value ASC NULLS LAST,
      empresa_name ASC NULLS LAST,
      source ASC
  `;

  const [result, countResult] = await Promise.all([
    dbPool.query(
      `${alertsBaseSql}
       SELECT *
       FROM alerts
       ${whereSql}
       ${orderSql}
       ${paginationSql}`,
      values
    ),
    dbPool.query(
      `${alertsBaseSql}
       SELECT count(*)::bigint AS total
       FROM alerts
       ${whereSql}`,
      countValues
    )
  ]);

  const numericFields = ["rut", "document_type", "metric_value", "metric_secondary"];
  const items = result.rows.map((row) => {
    const item = { ...row };

    numericFields.forEach((field) => {
      if (item[field] !== null && item[field] !== undefined) {
        item[field] = Number(item[field]);
      }
    });

    return item;
  });

  return {
    items,
    pagination: {
      limit: query.limit,
      offset: query.offset,
      total: Number(countResult.rows[0]?.total ?? 0)
    }
  };
};

const buildDocumentsWhere = (query: DocumentsSummaryQuery, values: unknown[]) => {
  const clauses: string[] = [];

  addFilter(clauses, values, "tenant_id = ?", query.tenantId);
  addFilter(clauses, values, "rut = ?", query.rut);

  return clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
};

export const getDocumentsSummary = async (
  query: DocumentsSummaryQuery
): Promise<DocumentsSummaryResult> => {
  const totalValues: unknown[] = [];
  const totalWhereSql = buildDocumentsWhere(query, totalValues);
  const totalsResult = await dbPool.query(
    `SELECT
       count(*)::bigint AS documents,
       count(DISTINCT tenant_id || '-' || rut::text)::bigint AS companies,
       count(DISTINCT device_id)::bigint AS devices,
       count(DISTINCT tipodocumento)::bigint AS document_types
     FROM rr_gestion_soporte.documentos_2026
     ${totalWhereSql}`,
    totalValues
  );

  const monthlyValues: unknown[] = [];
  const monthlyWhereSql = buildDocumentsWhere(query, monthlyValues);
  const monthlyResult = await dbPool.query(
    `SELECT
       periodo,
       count(*)::bigint AS documents
     FROM rr_gestion_soporte.documentos_2026
     ${monthlyWhereSql}
     GROUP BY periodo
     ORDER BY periodo`,
    monthlyValues
  );

  const typeValues: unknown[] = [];
  const typeWhereSql = buildDocumentsWhere(query, typeValues);
  const typeResult = await dbPool.query(
    `SELECT
       tipodocumento,
       count(*)::bigint AS documents
     FROM rr_gestion_soporte.documentos_2026
     ${typeWhereSql}
     GROUP BY tipodocumento
     ORDER BY tipodocumento`,
    typeValues
  );

  const totals = totalsResult.rows[0] as {
    companies: string;
    devices: string;
    documents: string;
    document_types: string;
  };

  return {
    filters: {
      tenantId: query.tenantId,
      rut: query.rut
    },
    totals: {
      companies: Number(totals.companies),
      devices: Number(totals.devices),
      documents: Number(totals.documents),
      documentTypes: Number(totals.document_types)
    },
    monthly: monthlyResult.rows.map((row) => ({
      documents: Number(row.documents),
      period: row.period as string
    })),
    byDocumentType: typeResult.rows.map((row) => ({
      documentType: Number(row.tipodocumento),
      documents: Number(row.documents)
    }))
  };
};

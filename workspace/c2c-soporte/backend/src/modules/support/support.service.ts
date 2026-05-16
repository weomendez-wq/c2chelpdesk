import { dbPool } from "../../config/database.js";
import type {
  CompaniesQuery,
  CompanyControlQuery,
  CompanyDevicesQuery,
  DeviceControlQuery,
  DocumentsSummaryQuery,
  DevicesQuery
} from "./support.schemas.js";

export type PaginatedResult<TItem> = {
  items: TItem[];
  pagination: {
    limit: number;
    offset: number;
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

  return {
    items: result.rows,
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
  const paginationSql = appendPagination(values, query.limit, query.offset);

  const result = await dbPool.query(
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
  );

  return {
    items: result.rows,
    pagination: {
      limit: query.limit,
      offset: query.offset
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
  const paginationSql = appendPagination(values, query.limit, query.offset);

  const result = await dbPool.query(
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
  );

  return {
    items: result.rows,
    pagination: {
      limit: query.limit,
      offset: query.offset
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

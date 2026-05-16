-- C2C Soporte - vistas operativas folios y CAF
-- Ejecutar conectado a la base local soporte.
-- No ejecutar en produccion.
-- No apunta a public. Solo crea o reemplaza vistas de lectura locales.

CREATE OR REPLACE VIEW rr_gestion_soporte.folios_caf_resumen AS
SELECT
  c.tenant_id,
  t.name AS tenant_name,
  t.status AS tenant_status,
  c.rut,
  e.name AS empresa_name,
  e.status AS empresa_status,
  c.document_type,
  count(*)::bigint AS caf_count,
  coalesce(sum(c.folio_fin - c.folio_ini + 1), 0)::bigint AS folios_otorgados,
  min(c.created_at) AS primer_caf,
  max(c.created_at) AS ultimo_caf,
  min(c.folio_ini)::bigint AS folio_min,
  max(c.folio_fin)::bigint AS folio_max
FROM staging_public.caf c
LEFT JOIN staging_public.empresa e
  ON e.tenant_id = c.tenant_id
 AND e.rut = c.rut
LEFT JOIN staging_public.tenant t
  ON t.tenant_id = c.tenant_id
GROUP BY
  c.tenant_id,
  t.name,
  t.status,
  c.rut,
  e.name,
  e.status,
  c.document_type;

COMMENT ON VIEW rr_gestion_soporte.folios_caf_resumen IS
  'Resumen local de CAF por tenant, rut y tipo documento. Fuente: staging_public.caf.';

CREATE OR REPLACE VIEW rr_gestion_soporte.folios_disponibles_resumen AS
SELECT
  fd.tenant_id,
  t.name AS tenant_name,
  t.status AS tenant_status,
  fd.rut,
  e.name AS empresa_name,
  e.status AS empresa_status,
  fd.document_type,
  count(*)::bigint AS rangos_disponibles,
  coalesce(sum(fd.folio_fin - fd.folio_ini + 1), 0)::bigint AS folios_disponibles,
  min(fd.folio_ini)::bigint AS folio_disponible_min,
  max(fd.folio_fin)::bigint AS folio_disponible_max,
  CASE
    WHEN coalesce(sum(fd.folio_fin - fd.folio_ini + 1), 0) <= 0 THEN 'SIN_FOLIOS'
    WHEN coalesce(sum(fd.folio_fin - fd.folio_ini + 1), 0) <= 10000 THEN 'URGENTE'
    WHEN coalesce(sum(fd.folio_fin - fd.folio_ini + 1), 0) <= 30000 THEN 'WARNING'
    ELSE 'OK'
  END AS nivel_alerta_disponibles
FROM staging_public.foliosdisponibles fd
LEFT JOIN staging_public.empresa e
  ON e.tenant_id = fd.tenant_id
 AND e.rut = fd.rut
LEFT JOIN staging_public.tenant t
  ON t.tenant_id = fd.tenant_id
GROUP BY
  fd.tenant_id,
  t.name,
  t.status,
  fd.rut,
  e.name,
  e.status,
  fd.document_type;

COMMENT ON VIEW rr_gestion_soporte.folios_disponibles_resumen IS
  'Resumen local de folios disponibles por tenant, rut y tipo documento. Fuente: staging_public.foliosdisponibles.';

CREATE OR REPLACE VIEW rr_gestion_soporte.folios_historial_resumen AS
SELECT
  h.tenant_id,
  t.name AS tenant_name,
  t.status AS tenant_status,
  h.rut,
  e.name AS empresa_name,
  e.status AS empresa_status,
  h.device_id,
  d.name AS device_name,
  d.status AS device_status,
  h.document_type,
  count(*)::bigint AS cargas_historial,
  coalesce(sum(h.folio_fin::bigint - h.folio_ini::bigint + 1), 0)::bigint AS folios_entregados_por_rango,
  coalesce(sum(h.cantidad_solicitada), 0)::bigint AS folios_solicitados,
  coalesce(sum(h.cantidad_solicitada), 0)::bigint
    - coalesce(sum(h.folio_fin::bigint - h.folio_ini::bigint + 1), 0)::bigint
    AS diferencia_solicitado_rango,
  min(nullif(h.fecha_peticion, '')) AS primera_peticion,
  max(nullif(h.fecha_peticion, '')) AS ultima_peticion,
  CASE
    WHEN coalesce(sum(h.cantidad_solicitada), 0)::bigint
       = coalesce(sum(h.folio_fin::bigint - h.folio_ini::bigint + 1), 0)::bigint THEN 'OK'
    ELSE 'REVISION_DATOS'
  END AS cuadratura_historial
FROM staging_public.historialasignacionfolios h
LEFT JOIN staging_public.empresa e
  ON e.tenant_id = h.tenant_id
 AND e.rut = h.rut
LEFT JOIN staging_public.tenant t
  ON t.tenant_id = h.tenant_id
LEFT JOIN staging_public.device d
  ON d.tenant_id = h.tenant_id
 AND d.device_id = h.device_id
GROUP BY
  h.tenant_id,
  t.name,
  t.status,
  h.rut,
  e.name,
  e.status,
  h.device_id,
  d.name,
  d.status,
  h.document_type;

COMMENT ON VIEW rr_gestion_soporte.folios_historial_resumen IS
  'Resumen local de historial de asignacion de folios por tenant, rut, device y tipo documento.';

CREATE OR REPLACE VIEW rr_gestion_soporte.folios_control_resumen AS
WITH keys AS (
  SELECT tenant_id, rut, document_type
  FROM rr_gestion_soporte.folios_caf_resumen
  UNION
  SELECT tenant_id, rut, document_type
  FROM rr_gestion_soporte.folios_disponibles_resumen
  UNION
  SELECT tenant_id, rut, document_type
  FROM rr_gestion_soporte.folios_historial_resumen
  UNION
  SELECT tenant_id, rut, tipodocumento AS document_type
  FROM rr_gestion_soporte.documentos_2026_normalizados
  WHERE tenant_id IS NOT NULL
    AND rut IS NOT NULL
    AND tipodocumento IS NOT NULL
),
historial AS (
  SELECT
    tenant_id,
    rut,
    document_type,
    sum(cargas_historial)::bigint AS cargas_historial,
    sum(folios_entregados_por_rango)::bigint AS folios_entregados_por_rango,
    sum(folios_solicitados)::bigint AS folios_solicitados,
    sum(diferencia_solicitado_rango)::bigint AS diferencia_solicitado_rango,
    count(*) FILTER (WHERE cuadratura_historial <> 'OK')::bigint AS devices_con_revision_historial
  FROM rr_gestion_soporte.folios_historial_resumen
  GROUP BY tenant_id, rut, document_type
),
documentos AS (
  SELECT
    tenant_id,
    rut,
    tipodocumento AS document_type,
    count(*)::bigint AS documentos_emitidos_2026,
    count(DISTINCT device_id)::bigint AS devices_con_emision,
    min(fecha_emision) AS primera_emision,
    max(fecha_emision) AS ultima_emision
  FROM rr_gestion_soporte.documentos_2026_normalizados
  GROUP BY tenant_id, rut, tipodocumento
)
SELECT
  k.tenant_id,
  coalesce(c.tenant_name, fd.tenant_name, t.name) AS tenant_name,
  coalesce(c.tenant_status, fd.tenant_status, t.status) AS tenant_status,
  k.rut,
  coalesce(c.empresa_name, fd.empresa_name, e.name) AS empresa_name,
  coalesce(c.empresa_status, fd.empresa_status, e.status) AS empresa_status,
  k.document_type,
  coalesce(c.caf_count, 0) AS caf_count,
  coalesce(c.folios_otorgados, 0) AS folios_otorgados,
  c.primer_caf,
  c.ultimo_caf,
  c.folio_min,
  c.folio_max,
  coalesce(fd.rangos_disponibles, 0) AS rangos_disponibles,
  coalesce(fd.folios_disponibles, 0) AS folios_disponibles,
  fd.folio_disponible_min,
  fd.folio_disponible_max,
  coalesce(h.cargas_historial, 0) AS cargas_historial,
  coalesce(h.folios_entregados_por_rango, 0) AS folios_entregados_por_rango,
  coalesce(h.folios_solicitados, 0) AS folios_solicitados,
  coalesce(h.diferencia_solicitado_rango, 0) AS diferencia_solicitado_rango,
  coalesce(h.devices_con_revision_historial, 0) AS devices_con_revision_historial,
  coalesce(docs.documentos_emitidos_2026, 0) AS documentos_emitidos_2026,
  coalesce(docs.devices_con_emision, 0) AS devices_con_emision,
  docs.primera_emision,
  docs.ultima_emision,
  CASE
    WHEN docs.ultima_emision IS NULL THEN NULL
    ELSE current_date - docs.ultima_emision
  END AS dias_sin_emitir,
  CASE
    WHEN coalesce(h.diferencia_solicitado_rango, 0) <> 0 THEN 'REVISION_DATOS'
    WHEN coalesce(h.devices_con_revision_historial, 0) > 0 THEN 'REVISION_DATOS'
    WHEN coalesce(docs.documentos_emitidos_2026, 0) > coalesce(c.folios_otorgados, 0)
      AND coalesce(c.folios_otorgados, 0) > 0 THEN 'REVISION_DATOS'
    WHEN coalesce(c.folios_otorgados, 0) > 0
      AND coalesce(fd.folios_disponibles, 0) <= 0 THEN 'SIN_FOLIOS'
    WHEN coalesce(fd.folios_disponibles, 0) > 0
      AND coalesce(fd.folios_disponibles, 0) <= 10000 THEN 'URGENTE'
    WHEN coalesce(fd.folios_disponibles, 0) > 10000
      AND coalesce(fd.folios_disponibles, 0) <= 30000 THEN 'WARNING'
    ELSE 'OK'
  END AS nivel_alerta_folios
FROM keys k
LEFT JOIN rr_gestion_soporte.folios_caf_resumen c
  ON c.tenant_id = k.tenant_id
 AND c.rut = k.rut
 AND c.document_type = k.document_type
LEFT JOIN rr_gestion_soporte.folios_disponibles_resumen fd
  ON fd.tenant_id = k.tenant_id
 AND fd.rut = k.rut
 AND fd.document_type = k.document_type
LEFT JOIN historial h
  ON h.tenant_id = k.tenant_id
 AND h.rut = k.rut
 AND h.document_type = k.document_type
LEFT JOIN documentos docs
  ON docs.tenant_id = k.tenant_id
 AND docs.rut = k.rut
 AND docs.document_type = k.document_type
LEFT JOIN staging_public.empresa e
  ON e.tenant_id = k.tenant_id
 AND e.rut = k.rut
LEFT JOIN staging_public.tenant t
  ON t.tenant_id = k.tenant_id;

COMMENT ON VIEW rr_gestion_soporte.folios_control_resumen IS
  'Control local de folios y CAF por tenant, rut y tipo documento para soporte.';

-- C2C Soporte - control local de vencimiento CAF facturas 33
-- Ejecutar conectado a la base local soporte.
-- No ejecutar en origen productivo.
-- No toca public. Extrae solo fecha FA desde xml_caf local.

CREATE OR REPLACE VIEW rr_gestion_soporte.caf_vencimiento_resumen AS
WITH base AS (
  SELECT
    c.tenant_id,
    t.name AS tenant_name,
    c.rut,
    e.name AS empresa_name,
    c.document_type,
    c.cafserial,
    c.folio_ini,
    c.folio_fin,
    c.created_at AS caf_created_at,
    substring(c.xml_caf FROM '<FA>([0-9]{4}-[0-9]{2}-[0-9]{2})</FA>') AS fa_text
  FROM staging_public.caf c
  LEFT JOIN staging_public.tenant t
    ON t.tenant_id = c.tenant_id
  LEFT JOIN staging_public.empresa e
    ON e.tenant_id = c.tenant_id
   AND e.rut = c.rut
),
fechas AS (
  SELECT
    *,
    CASE
      WHEN fa_text IS NULL THEN NULL
      ELSE fa_text::date
    END AS caf_fecha_autorizacion
  FROM base
)
SELECT
  tenant_id,
  tenant_name,
  rut,
  empresa_name,
  document_type,
  cafserial,
  folio_ini,
  folio_fin,
  caf_created_at,
  caf_fecha_autorizacion,
  CASE
    WHEN document_type = 33 AND caf_fecha_autorizacion IS NOT NULL
      THEN (caf_fecha_autorizacion + interval '6 months')::date
    ELSE NULL
  END AS caf_fecha_vencimiento,
  CASE
    WHEN document_type = 33 AND caf_fecha_autorizacion IS NOT NULL
      THEN ((caf_fecha_autorizacion + interval '6 months')::date - current_date)
    ELSE NULL
  END AS caf_dias_para_vencer,
  CASE
    WHEN document_type <> 33 THEN 'NO_APLICA'
    WHEN caf_fecha_autorizacion IS NULL THEN 'SIN_FECHA_CAF'
    WHEN (caf_fecha_autorizacion + interval '6 months')::date <= current_date THEN 'URGENTE'
    WHEN (caf_fecha_autorizacion + interval '6 months')::date <= current_date + interval '30 days' THEN 'WARNING'
    ELSE 'OK'
  END AS nivel_alerta_caf_vencimiento
FROM fechas;

COMMENT ON VIEW rr_gestion_soporte.caf_vencimiento_resumen IS
  'Extraccion local de FA desde xml_caf y vencimiento operacional para CAF tipo 33.';

CREATE TABLE IF NOT EXISTS rr_gestion_soporte.caf_vencimiento_cache AS
SELECT *
FROM rr_gestion_soporte.caf_vencimiento_resumen;

ALTER TABLE rr_gestion_soporte.folios_rangos_clasificados_cache
  ADD COLUMN IF NOT EXISTS caf_fecha_autorizacion date,
  ADD COLUMN IF NOT EXISTS caf_fecha_vencimiento date,
  ADD COLUMN IF NOT EXISTS caf_dias_para_vencer integer,
  ADD COLUMN IF NOT EXISTS nivel_alerta_caf_vencimiento text;

CREATE INDEX IF NOT EXISTS idx_caf_vencimiento_cache_alert
  ON rr_gestion_soporte.caf_vencimiento_cache (nivel_alerta_caf_vencimiento, document_type, tenant_id, rut);

CREATE INDEX IF NOT EXISTS idx_caf_vencimiento_cache_rango
  ON rr_gestion_soporte.caf_vencimiento_cache (tenant_id, rut, document_type, cafserial, folio_ini, folio_fin);

CREATE INDEX IF NOT EXISTS idx_folios_rangos_cache_caf_vencimiento
  ON rr_gestion_soporte.folios_rangos_clasificados_cache (nivel_alerta_caf_vencimiento, caf_fecha_vencimiento);

ANALYZE rr_gestion_soporte.caf_vencimiento_cache;
ANALYZE rr_gestion_soporte.folios_rangos_clasificados_cache;

\echo 'caf_vencimiento_resumen'
SELECT
  document_type,
  nivel_alerta_caf_vencimiento,
  count(*) AS cafs,
  min(caf_fecha_autorizacion) AS primera_autorizacion,
  max(caf_fecha_vencimiento) AS ultimo_vencimiento
FROM rr_gestion_soporte.caf_vencimiento_resumen
GROUP BY document_type, nivel_alerta_caf_vencimiento
ORDER BY document_type, nivel_alerta_caf_vencimiento;

-- C2C Soporte - vista control empresa
-- Ejecutar conectado a la base local soporte.
-- No ejecutar en produccion.

CREATE OR REPLACE VIEW rr_gestion_soporte.empresa_control_resumen AS
WITH documentos_normalizados AS (
  SELECT
    tenant_id,
    rut,
    CASE
      WHEN fechaemision ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
        THEN to_date(fechaemision, 'YYYY-MM-DD')
      ELSE NULL
    END AS fecha_emision
  FROM rr_gestion_soporte.documentos_2026
),
actividad AS (
  SELECT
    tenant_id,
    rut,
    count(*) AS documentos_emitidos,
    min(fecha_emision) AS primera_emision,
    max(fecha_emision) AS ultima_emision
  FROM documentos_normalizados
  GROUP BY tenant_id, rut
)
SELECT
  e.tenant_id,
  t.name AS tenant_name,
  t.status AS tenant_status,
  e.rut,
  e.name AS empresa_name,
  e.status AS empresa_status,
  e.giro,
  e.comuna,
  e.ciudad,
  coalesce(a.documentos_emitidos, 0) AS documentos_emitidos_2026,
  a.primera_emision,
  a.ultima_emision,
  CASE
    WHEN a.primera_emision IS NULL THEN NULL
    ELSE current_date - a.primera_emision
  END AS dias_desde_primera_emision,
  CASE
    WHEN a.ultima_emision IS NULL THEN NULL
    ELSE current_date - a.ultima_emision
  END AS dias_sin_emitir,
  CASE
    WHEN coalesce(a.documentos_emitidos, 0) = 0 THEN 'SIN_EMISION'
    WHEN current_date - a.ultima_emision >= 7 THEN 'URGENTE'
    WHEN current_date - a.ultima_emision >= 3 THEN 'WARNING'
    ELSE 'OK'
  END AS nivel_alerta_emision
FROM staging_public.empresa e
LEFT JOIN staging_public.tenant t
  ON t.tenant_id = e.tenant_id
LEFT JOIN actividad a
  ON a.tenant_id = e.tenant_id
 AND a.rut = e.rut;

COMMENT ON VIEW rr_gestion_soporte.empresa_control_resumen IS
  'Control inicial por empresa: estado, actividad 2026 y alerta por tiempo sin emision.';

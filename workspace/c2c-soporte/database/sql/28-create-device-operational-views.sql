-- C2C Soporte - vistas operativas por device
-- Ejecutar conectado a la base local soporte.
-- No ejecutar en produccion.
-- Solo crea o reemplaza vistas de lectura.

CREATE OR REPLACE VIEW rr_gestion_soporte.device_control_resumen AS
WITH empresa_principal AS (
  SELECT DISTINCT ON (tenant_id)
    tenant_id,
    rut,
    name AS empresa_name,
    status AS empresa_status
  FROM staging_public.empresa
  ORDER BY
    tenant_id,
    CASE status
      WHEN 'active' THEN 1
      ELSE 2
    END,
    name
),
actividad_device AS (
  SELECT
    tenant_id,
    device_id,
    max(rut) AS rut_documento,
    count(*) AS documentos_emitidos_2026,
    count(DISTINCT periodo) AS periodos_con_emision,
    min(fecha_emision) AS primera_emision,
    max(fecha_emision) AS ultima_emision,
    sum(coalesce(valortotal, 0)) AS total_valor_documentos
  FROM rr_gestion_soporte.documentos_2026_normalizados
  GROUP BY
    tenant_id,
    device_id
)
SELECT
  d.tenant_id,
  t.name AS tenant_name,
  t.status AS tenant_status,
  coalesce(ad.rut_documento, ep.rut) AS rut,
  ep.empresa_name,
  ep.empresa_status,
  d.device_id,
  d.name AS device_name,
  d.status AS device_status,
  d.local,
  d.comuna,
  d.ciudad,
  d.deviceconfiggroup_id,
  dcg.name AS config_group_name,
  dcg.status AS config_group_status,
  d.created_at,
  CASE
    WHEN d.created_at IS NULL THEN NULL
    ELSE current_date - d.created_at::date
  END AS dias_desde_creacion,
  CASE
    WHEN d.created_at IS NULL THEN 'SIN_FECHA'
    WHEN current_date - d.created_at::date <= 90 THEN 'EN_GARANTIA'
    ELSE 'GARANTIA_EXPIRADA'
  END AS estado_garantia,
  coalesce(ad.documentos_emitidos_2026, 0) AS documentos_emitidos_2026,
  coalesce(ad.periodos_con_emision, 0) AS periodos_con_emision,
  ad.primera_emision,
  ad.ultima_emision,
  CASE
    WHEN ad.ultima_emision IS NULL THEN NULL
    ELSE current_date - ad.ultima_emision
  END AS dias_sin_emitir,
  CASE
    WHEN coalesce(ad.periodos_con_emision, 0) = 0 THEN 0
    ELSE round(ad.documentos_emitidos_2026::numeric / ad.periodos_con_emision, 2)
  END AS promedio_documentos_periodo,
  coalesce(ad.total_valor_documentos, 0) AS total_valor_documentos,
  CASE
    WHEN ad.ultima_emision IS NULL THEN 'SIN_EMISION'
    WHEN current_date - ad.ultima_emision >= 7 THEN 'URGENTE'
    WHEN current_date - ad.ultima_emision >= 3 THEN 'WARNING'
    ELSE 'OK'
  END AS nivel_alerta_emision,
  CASE
    WHEN d.status = 'active' AND ad.ultima_emision IS NULL THEN 'ACTIVO_SIN_EMISION'
    WHEN d.status = 'active' AND ad.ultima_emision IS NOT NULL AND current_date - ad.ultima_emision >= 3 THEN 'ACTIVO_SIN_EMISION_RECIENTE'
    WHEN d.status IN ('disabled', 'suspended') AND ad.ultima_emision IS NOT NULL THEN 'NO_ACTIVO_CON_EMISION'
    ELSE 'OK'
  END AS alerta_consistencia
FROM staging_public.device d
LEFT JOIN staging_public.tenant t
  ON t.tenant_id = d.tenant_id
LEFT JOIN empresa_principal ep
  ON ep.tenant_id = d.tenant_id
LEFT JOIN staging_public.deviceconfiggroup dcg
  ON dcg.deviceconfiggroup_id = d.deviceconfiggroup_id
LEFT JOIN actividad_device ad
  ON ad.tenant_id = d.tenant_id
 AND ad.device_id = d.device_id;

COMMENT ON VIEW rr_gestion_soporte.device_control_resumen IS
  'Control operacional por device: empresa, estado, garantia, actividad documental y alertas.';

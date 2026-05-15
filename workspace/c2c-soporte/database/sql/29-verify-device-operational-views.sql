-- C2C Soporte - verificacion vista operacional por device
-- Ejecutar conectado a la base local soporte.
-- Solo lectura.

\echo 'device_control_resumen_total'
SELECT count(*) AS total_devices_control
FROM rr_gestion_soporte.device_control_resumen;

\echo 'staging_device_total'
SELECT count(*) AS total_devices_staging
FROM staging_public.device;

\echo 'device_control_por_status'
SELECT
  device_status,
  count(*) AS devices,
  sum(documentos_emitidos_2026) AS documentos_emitidos_2026
FROM rr_gestion_soporte.device_control_resumen
GROUP BY device_status
ORDER BY device_status;

\echo 'device_control_por_alerta'
SELECT
  nivel_alerta_emision,
  count(*) AS devices
FROM rr_gestion_soporte.device_control_resumen
GROUP BY nivel_alerta_emision
ORDER BY
  CASE nivel_alerta_emision
    WHEN 'URGENTE' THEN 1
    WHEN 'SIN_EMISION' THEN 2
    WHEN 'WARNING' THEN 3
    ELSE 4
  END,
  nivel_alerta_emision;

\echo 'device_control_consistencia'
SELECT
  alerta_consistencia,
  count(*) AS devices
FROM rr_gestion_soporte.device_control_resumen
GROUP BY alerta_consistencia
ORDER BY
  CASE alerta_consistencia
    WHEN 'ACTIVO_SIN_EMISION' THEN 1
    WHEN 'ACTIVO_SIN_EMISION_RECIENTE' THEN 2
    WHEN 'NO_ACTIVO_CON_EMISION' THEN 3
    ELSE 4
  END,
  alerta_consistencia;

\echo 'device_control_top_urgentes'
SELECT
  tenant_id,
  rut,
  empresa_name,
  device_id,
  device_name,
  device_status,
  documentos_emitidos_2026,
  ultima_emision,
  dias_sin_emitir,
  nivel_alerta_emision,
  alerta_consistencia
FROM rr_gestion_soporte.device_control_resumen
WHERE nivel_alerta_emision IN ('URGENTE', 'SIN_EMISION', 'WARNING')
ORDER BY
  CASE nivel_alerta_emision
    WHEN 'URGENTE' THEN 1
    WHEN 'SIN_EMISION' THEN 2
    WHEN 'WARNING' THEN 3
    ELSE 4
  END,
  dias_sin_emitir DESC NULLS FIRST,
  empresa_name ASC NULLS LAST
LIMIT 50;

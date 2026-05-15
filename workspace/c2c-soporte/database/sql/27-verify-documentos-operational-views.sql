-- C2C Soporte - verificacion vistas documentales operativas
-- Ejecutar conectado a la base local soporte.
-- Solo lectura.

\echo 'documentos_2026_normalizados_total'
SELECT count(*) AS total_documentos_normalizados
FROM rr_gestion_soporte.documentos_2026_normalizados;

\echo 'documentos_2026_base_total'
SELECT count(*) AS total_documentos_base
FROM rr_gestion_soporte.documentos_2026;

\echo 'documentos_2026_fechas_invalidas'
SELECT count(*) AS fechas_invalidas
FROM rr_gestion_soporte.documentos_2026_normalizados
WHERE fecha_emision IS NULL;

\echo 'documentos_2026_mensual_por_periodo'
SELECT
  periodo,
  sum(documentos) AS documentos,
  sum(total_valor_documentos) AS total_valor_documentos
FROM rr_gestion_soporte.documentos_2026_mensual
GROUP BY periodo
ORDER BY periodo;

\echo 'documentos_2026_device_mensual_top'
SELECT
  tenant_id,
  device_id,
  periodo,
  sum(documentos) AS documentos
FROM rr_gestion_soporte.documentos_2026_device_mensual
GROUP BY
  tenant_id,
  device_id,
  periodo
ORDER BY documentos DESC
LIMIT 20;

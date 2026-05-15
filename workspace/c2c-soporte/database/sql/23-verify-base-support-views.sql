-- C2C Soporte - verificacion vistas base soporte
-- Ejecutar conectado a la base local soporte.

SELECT 'empresas_resumen' AS view_name, count(*) AS rows_count
FROM rr_gestion_soporte.empresas_resumen
UNION ALL
SELECT 'dispositivos_resumen' AS view_name, count(*) AS rows_count
FROM rr_gestion_soporte.dispositivos_resumen
UNION ALL
SELECT 'empresa_dispositivo_resumen' AS view_name, count(*) AS rows_count
FROM rr_gestion_soporte.empresa_dispositivo_resumen
ORDER BY view_name;

SELECT
  empresa_status,
  count(*) AS empresas
FROM rr_gestion_soporte.empresas_resumen
GROUP BY empresa_status
ORDER BY empresa_status;

SELECT
  device_status,
  count(*) AS dispositivos
FROM rr_gestion_soporte.dispositivos_resumen
GROUP BY device_status
ORDER BY device_status;

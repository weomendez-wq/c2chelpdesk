-- C2C Soporte - verificacion historial, cajeros y proyeccion folios
-- Ejecutar conectado a la base local soporte.
-- Solo lectura. No apunta a public.

\echo 'documentos_historial_anual_resumen_total'
SELECT count(*) AS resumenes_historicos
FROM rr_gestion_soporte.documentos_historial_anual_resumen;

\echo 'folios_alerta_config_total'
SELECT
  count(*) AS configuraciones,
  count(*) FILTER (WHERE activo) AS configuraciones_activas
FROM rr_gestion_soporte.folios_alerta_config;

\echo 'cajero_control_resumen_totales'
SELECT
  count(*) AS filas_cajero_control,
  count(DISTINCT tenant_id) AS tenants,
  count(DISTINCT device_id) AS devices,
  sum(documentos_emitidos_2026) AS documentos_emitidos_2026
FROM rr_gestion_soporte.cajero_control_resumen;

\echo 'cajero_control_resumen_estado_operacional'
SELECT
  estado_operacional_cajero,
  count(*) AS cajeros
FROM rr_gestion_soporte.cajero_control_resumen
GROUP BY estado_operacional_cajero
ORDER BY cajeros DESC;

\echo 'folios_proyeccion_agotamiento_alertas'
SELECT
  nivel_alerta_agotamiento,
  count(*) AS combinaciones,
  sum(folios_disponibles) AS folios_disponibles
FROM rr_gestion_soporte.folios_proyeccion_agotamiento
GROUP BY nivel_alerta_agotamiento
ORDER BY
  CASE nivel_alerta_agotamiento
    WHEN 'URGENTE' THEN 1
    WHEN 'WARNING' THEN 2
    WHEN 'SIN_BASE_ESTIMACION' THEN 3
    ELSE 4
  END;

\echo 'folios_rangos_estado'
SELECT
  estado_rango,
  count(*) AS rangos,
  sum(folios_rango) AS folios_rango
FROM rr_gestion_soporte.folios_rangos_estado
GROUP BY estado_rango
ORDER BY
  CASE estado_rango
    WHEN 'CADUCADO_CANDIDATO' THEN 1
    WHEN 'POR_OCUPAR' THEN 2
    WHEN 'EN_USO' THEN 3
    WHEN 'AGOTADO' THEN 4
    ELSE 5
  END;

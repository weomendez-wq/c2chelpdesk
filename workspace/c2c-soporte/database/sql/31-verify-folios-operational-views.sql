-- C2C Soporte - verificacion vistas operativas folios y CAF
-- Ejecutar conectado a la base local soporte.
-- Solo lectura. No apunta a public.

\echo 'folios_caf_resumen_totales'
SELECT
  count(*) AS combinaciones_caf,
  sum(caf_count) AS caf_count,
  sum(folios_otorgados) AS folios_otorgados
FROM rr_gestion_soporte.folios_caf_resumen;

\echo 'folios_disponibles_resumen_totales'
SELECT
  count(*) AS combinaciones_disponibles,
  sum(rangos_disponibles) AS rangos_disponibles,
  sum(folios_disponibles) AS folios_disponibles
FROM rr_gestion_soporte.folios_disponibles_resumen;

\echo 'folios_historial_resumen_totales'
SELECT
  count(*) AS combinaciones_historial_device,
  sum(cargas_historial) AS cargas_historial,
  sum(folios_entregados_por_rango) AS folios_entregados_por_rango,
  sum(folios_solicitados) AS folios_solicitados,
  sum(diferencia_solicitado_rango) AS diferencia_solicitado_rango
FROM rr_gestion_soporte.folios_historial_resumen;

\echo 'folios_control_resumen_alertas'
SELECT
  nivel_alerta_folios,
  count(*) AS combinaciones,
  sum(folios_otorgados) AS folios_otorgados,
  sum(folios_disponibles) AS folios_disponibles,
  sum(documentos_emitidos_2026) AS documentos_emitidos_2026
FROM rr_gestion_soporte.folios_control_resumen
GROUP BY nivel_alerta_folios
ORDER BY
  CASE nivel_alerta_folios
    WHEN 'REVISION_DATOS' THEN 1
    WHEN 'SIN_FOLIOS' THEN 2
    WHEN 'URGENTE' THEN 3
    WHEN 'WARNING' THEN 4
    ELSE 5
  END;

\echo 'folios_control_resumen_top_revision'
SELECT
  tenant_id,
  rut,
  empresa_name,
  document_type,
  caf_count,
  folios_otorgados,
  folios_disponibles,
  folios_solicitados,
  folios_entregados_por_rango,
  diferencia_solicitado_rango,
  documentos_emitidos_2026,
  nivel_alerta_folios
FROM rr_gestion_soporte.folios_control_resumen
WHERE nivel_alerta_folios <> 'OK'
ORDER BY
  CASE nivel_alerta_folios
    WHEN 'REVISION_DATOS' THEN 1
    WHEN 'SIN_FOLIOS' THEN 2
    WHEN 'URGENTE' THEN 3
    WHEN 'WARNING' THEN 4
    ELSE 5
  END,
  abs(diferencia_solicitado_rango) DESC,
  folios_disponibles ASC
LIMIT 50;

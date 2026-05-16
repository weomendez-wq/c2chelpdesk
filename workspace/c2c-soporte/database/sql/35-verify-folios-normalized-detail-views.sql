-- C2C Soporte - verificacion vistas normalizadas detalle folios
-- Ejecutar conectado a la base local soporte.
-- No ejecutar en produccion.

\echo 'documentos_sin_caf_resumen_totales'
SELECT
  count(*) AS combinaciones,
  coalesce(sum(documentos_sin_caf), 0) AS documentos_sin_caf,
  coalesce(sum(devices_afectados), 0) AS devices_afectados
FROM rr_gestion_soporte.documentos_sin_caf_resumen;

\echo 'documentos_sin_caf_top'
SELECT
  tenant_id,
  rut,
  empresa_name,
  document_type,
  documentos_sin_caf,
  devices_afectados,
  primer_folio_sin_caf,
  ultimo_folio_sin_caf,
  ultima_emision_sin_caf
FROM rr_gestion_soporte.documentos_sin_caf_resumen
ORDER BY documentos_sin_caf DESC
LIMIT 20;

\echo 'folios_rangos_clasificados_detalle_estado'
SELECT
  estado_operativo_rango,
  estado_rango,
  clasificacion_temporal,
  count(*) AS rangos,
  coalesce(sum(total_rango), 0) AS folios_rango,
  coalesce(sum(total_ocupado), 0) AS total_ocupado,
  coalesce(sum(total_documentos_desocupados), 0) AS total_desocupado,
  coalesce(sum(lost_folios), 0) AS lost_folios
FROM rr_gestion_soporte.folios_rangos_clasificados_detalle
GROUP BY
  estado_operativo_rango,
  estado_rango,
  clasificacion_temporal
ORDER BY
  estado_operativo_rango,
  estado_rango,
  clasificacion_temporal;

\echo 'folios_resumen_empresa_extendido_estado'
SELECT
  estado_resumen_empresa,
  count(*) AS empresas,
  coalesce(sum(total_documentos), 0) AS total_documentos,
  coalesce(sum(total_documentos_sin_caf), 0) AS total_documentos_sin_caf,
  coalesce(sum(total_lost_folios), 0) AS total_lost_folios,
  coalesce(sum(total_folios_autorizados), 0) AS total_folios_autorizados,
  coalesce(sum(total_folios_por_utilizar), 0) AS total_folios_por_utilizar
FROM rr_gestion_soporte.folios_resumen_empresa_extendido
GROUP BY estado_resumen_empresa
ORDER BY
  CASE estado_resumen_empresa
    WHEN 'REVISION_DATOS' THEN 1
    WHEN 'WARNING' THEN 2
    WHEN 'OK' THEN 3
    ELSE 9
  END;

\echo 'folios_resumen_device_extendido_estado'
SELECT
  estado_folios_device,
  count(*) AS devices,
  coalesce(sum(documentos_emitidos_2026), 0) AS documentos_emitidos_2026,
  coalesce(sum(folios_entregados_por_rango), 0) AS folios_entregados_por_rango,
  coalesce(sum(folios_solicitados), 0) AS folios_solicitados,
  coalesce(sum(diferencia_solicitado_rango), 0) AS diferencia_solicitado_rango
FROM rr_gestion_soporte.folios_resumen_device_extendido
GROUP BY estado_folios_device
ORDER BY
  CASE estado_folios_device
    WHEN 'REVISION_DATOS' THEN 1
    WHEN 'PELIGRO' THEN 2
    WHEN 'CRITICO' THEN 3
    WHEN 'ALERTA' THEN 4
    WHEN 'OK' THEN 5
    ELSE 9
  END;


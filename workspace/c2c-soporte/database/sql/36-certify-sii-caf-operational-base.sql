-- C2C Soporte - certificacion base SII / CAF operacional
-- Ejecutar conectado a la base local soporte.
-- Solo lectura. No apunta a public y no modifica datos.

\echo '01_objetos_locales_requeridos'
SELECT
  object_name,
  to_regclass(object_name) IS NOT NULL AS exists
FROM (
  VALUES
    ('rr_gestion_soporte.caf_vencimiento_config'),
    ('rr_gestion_soporte.folios_alerta_config'),
    ('rr_gestion_soporte.cache_refresh_log'),
    ('rr_gestion_soporte.caf_vencimiento_cache'),
    ('rr_gestion_soporte.folios_control_resumen_cache'),
    ('rr_gestion_soporte.folios_proyeccion_agotamiento_cache'),
    ('rr_gestion_soporte.folios_rangos_clasificados_cache'),
    ('rr_gestion_soporte.alertas_operativas_cache'),
    ('rr_gestion_soporte.documentos_sin_caf_resumen')
) AS required(object_name)
ORDER BY object_name;

\echo '02_configuracion_dte_caf'
SELECT
  document_type,
  document_label,
  vigencia_meses,
  warning_dias,
  aplica_vencimiento,
  activo,
  updated_at
FROM rr_gestion_soporte.caf_vencimiento_config
WHERE document_type IN (33, 39, 41)
ORDER BY document_type;

\echo '03_configuracion_umbrales_folios_global'
SELECT
  config_id,
  tenant_id,
  rut,
  document_type,
  minimo_folios_warning,
  minimo_folios_urgente,
  dias_agotamiento_warning,
  dias_agotamiento_urgente,
  dias_sin_emision_warning,
  dias_sin_emision_urgente,
  activo,
  updated_at
FROM rr_gestion_soporte.folios_alerta_config
ORDER BY
  tenant_id NULLS FIRST,
  rut NULLS FIRST,
  document_type NULLS FIRST,
  config_id;

\echo '04_ultimo_refresco_cache'
SELECT
  refresh_id,
  status,
  started_at,
  finished_at,
  duration_ms,
  requested_by,
  message,
  cache_counts
FROM rr_gestion_soporte.cache_refresh_log
ORDER BY started_at DESC
LIMIT 1;

\echo '05_caf_vencimiento_por_tipo_y_alerta'
SELECT
  document_type,
  coalesce(document_label, 'SIN_ETIQUETA') AS document_label,
  nivel_alerta_caf_vencimiento,
  count(*)::bigint AS caf_count,
  coalesce(sum((folio_fin - folio_ini + 1)::bigint), 0) AS folios_otorgados,
  min(caf_fecha_autorizacion) AS primera_autorizacion,
  max(caf_fecha_vencimiento) AS ultimo_vencimiento,
  min(caf_dias_para_vencer) AS min_dias_para_vencer
FROM rr_gestion_soporte.caf_vencimiento_cache
WHERE document_type IN (33, 39, 41)
GROUP BY
  document_type,
  document_label,
  nivel_alerta_caf_vencimiento
ORDER BY
  document_type,
  CASE nivel_alerta_caf_vencimiento
    WHEN 'URGENTE' THEN 1
    WHEN 'WARNING' THEN 2
    WHEN 'SIN_FECHA_CAF' THEN 3
    WHEN 'OK' THEN 4
    WHEN 'NO_APLICA' THEN 5
    ELSE 9
  END;

\echo '06_folios_control_por_tipo_y_alerta'
SELECT
  document_type,
  nivel_alerta_folios,
  count(*)::bigint AS combinaciones,
  coalesce(sum(caf_count), 0)::bigint AS caf_count,
  coalesce(sum(folios_otorgados), 0)::bigint AS folios_otorgados,
  coalesce(sum(folios_disponibles), 0)::bigint AS folios_disponibles,
  coalesce(sum(documentos_emitidos_2026), 0)::bigint AS documentos_emitidos_2026,
  coalesce(sum(diferencia_solicitado_rango), 0)::bigint AS diferencia_solicitado_rango
FROM rr_gestion_soporte.folios_control_resumen_cache
WHERE document_type IN (33, 39, 41)
GROUP BY document_type, nivel_alerta_folios
ORDER BY
  document_type,
  CASE nivel_alerta_folios
    WHEN 'REVISION_DATOS' THEN 1
    WHEN 'SIN_FOLIOS' THEN 2
    WHEN 'URGENTE' THEN 3
    WHEN 'WARNING' THEN 4
    WHEN 'OK' THEN 5
    ELSE 9
  END;

\echo '07_agotamiento_por_tipo_y_alerta'
SELECT
  document_type,
  nivel_alerta_agotamiento,
  count(*)::bigint AS combinaciones,
  coalesce(sum(folios_disponibles), 0)::bigint AS folios_disponibles,
  min(dias_hasta_agotar_30d) AS min_dias_hasta_agotar_30d,
  min(dias_hasta_agotar_90d) AS min_dias_hasta_agotar_90d
FROM rr_gestion_soporte.folios_proyeccion_agotamiento_cache
WHERE document_type IN (33, 39, 41)
GROUP BY document_type, nivel_alerta_agotamiento
ORDER BY
  document_type,
  CASE nivel_alerta_agotamiento
    WHEN 'URGENTE' THEN 1
    WHEN 'WARNING' THEN 2
    WHEN 'SIN_BASE_CONSUMO' THEN 3
    WHEN 'SIN_FOLIOS' THEN 4
    WHEN 'OK' THEN 5
    ELSE 9
  END;

\echo '08_rangos_sii_por_estado'
SELECT
  document_type,
  estado_operativo_rango,
  clasificacion_temporal,
  count(*)::bigint AS rangos,
  coalesce(sum(total_rango), 0)::bigint AS folios_rango,
  coalesce(sum(total_ocupado), 0)::bigint AS total_ocupado,
  coalesce(sum(total_documentos_desocupados), 0)::bigint AS total_desocupado,
  coalesce(sum(lost_folios), 0)::bigint AS lost_folios
FROM rr_gestion_soporte.folios_rangos_clasificados_cache
WHERE document_type IN (33, 39, 41)
GROUP BY
  document_type,
  estado_operativo_rango,
  clasificacion_temporal
ORDER BY
  document_type,
  estado_operativo_rango,
  clasificacion_temporal;

\echo '09_documentos_sin_caf_por_tipo'
SELECT
  document_type,
  count(*)::bigint AS combinaciones,
  coalesce(sum(documentos_sin_caf), 0)::bigint AS documentos_sin_caf,
  coalesce(sum(devices_afectados), 0)::bigint AS devices_afectados,
  min(primera_emision_sin_caf) AS primera_emision_sin_caf,
  max(ultima_emision_sin_caf) AS ultima_emision_sin_caf
FROM rr_gestion_soporte.documentos_sin_caf_resumen
WHERE document_type IN (33, 39, 41)
GROUP BY document_type
ORDER BY document_type;

\echo '10_alertas_sii_caf_operativas'
SELECT
  source,
  severity,
  document_type,
  count(*)::bigint AS alertas,
  min(reference_date) AS primera_referencia,
  max(reference_date) AS ultima_referencia
FROM rr_gestion_soporte.alertas_operativas_cache
WHERE source IN ('FOLIOS', 'AGOTAMIENTO', 'CAF_VENCIMIENTO')
  AND (document_type IS NULL OR document_type IN (33, 39, 41))
GROUP BY source, severity, document_type
ORDER BY
  source,
  CASE severity
    WHEN 'URGENTE' THEN 1
    WHEN 'WARNING' THEN 2
    WHEN 'REVISION_DATOS' THEN 3
    WHEN 'SIN_FOLIOS' THEN 4
    ELSE 9
  END,
  document_type NULLS FIRST;

\echo '11_top_empresas_alertas_sii_caf_cache'
SELECT
  tenant_id,
  tenant_name,
  rut,
  empresa_name,
  count(*)::bigint AS alertas,
  count(*) FILTER (WHERE severity = 'URGENTE')::bigint AS urgentes,
  count(*) FILTER (WHERE severity = 'WARNING')::bigint AS warnings,
  count(*) FILTER (WHERE severity = 'REVISION_DATOS')::bigint AS revision_datos,
  string_agg(DISTINCT source, ', ' ORDER BY source) AS fuentes
FROM rr_gestion_soporte.alertas_operativas_cache
WHERE source IN ('FOLIOS', 'AGOTAMIENTO', 'CAF_VENCIMIENTO')
  AND (document_type IS NULL OR document_type IN (33, 39, 41))
GROUP BY
  tenant_id,
  tenant_name,
  rut,
  empresa_name
ORDER BY
  urgentes DESC,
  revision_datos DESC,
  warnings DESC,
  alertas DESC
LIMIT 50;

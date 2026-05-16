-- C2C Soporte - caches locales de lectura para UI
-- Ejecutar conectado a la base local soporte.
-- No ejecutar en origen productivo.
-- No toca public. Crea tablas cache en rr_gestion_soporte.
--
-- Primera version:
-- - Crea las tablas si no existen.
-- - No borra ni trunca datos.
-- - Si una cache ya existe, no se recalcula en este script.

\echo 'creating_document_summary_caches'

CREATE TABLE IF NOT EXISTS rr_gestion_soporte.documentos_2026_mensual_cache AS
SELECT *
FROM rr_gestion_soporte.documentos_2026_mensual;

CREATE TABLE IF NOT EXISTS rr_gestion_soporte.documentos_2026_device_mensual_cache AS
SELECT *
FROM rr_gestion_soporte.documentos_2026_device_mensual;

\echo 'creating_control_caches'

CREATE TABLE IF NOT EXISTS rr_gestion_soporte.empresa_control_resumen_cache AS
SELECT *
FROM rr_gestion_soporte.empresa_control_resumen;

CREATE TABLE IF NOT EXISTS rr_gestion_soporte.device_control_resumen_cache AS
SELECT *
FROM rr_gestion_soporte.device_control_resumen;

CREATE TABLE IF NOT EXISTS rr_gestion_soporte.folios_control_resumen_cache AS
SELECT *
FROM rr_gestion_soporte.folios_control_resumen;

CREATE TABLE IF NOT EXISTS rr_gestion_soporte.folios_proyeccion_agotamiento_cache AS
SELECT *
FROM rr_gestion_soporte.folios_proyeccion_agotamiento;

CREATE TABLE IF NOT EXISTS rr_gestion_soporte.folios_rangos_clasificados_cache AS
SELECT
  r.*,
  v.caf_fecha_autorizacion,
  v.caf_fecha_vencimiento,
  v.caf_dias_para_vencer,
  v.nivel_alerta_caf_vencimiento
FROM rr_gestion_soporte.folios_rangos_clasificados_detalle r
LEFT JOIN rr_gestion_soporte.caf_vencimiento_resumen v
  ON v.tenant_id = r.tenant_id
 AND v.rut = r.rut
 AND v.document_type = r.document_type
 AND v.cafserial IS NOT DISTINCT FROM r.cafserial
 AND v.folio_ini = r.folio_ini
 AND v.folio_fin = r.folio_fin;

CREATE TABLE IF NOT EXISTS rr_gestion_soporte.caf_vencimiento_cache AS
SELECT *
FROM rr_gestion_soporte.caf_vencimiento_resumen;

\echo 'creating_alerts_cache'

CREATE TABLE IF NOT EXISTS rr_gestion_soporte.alertas_operativas_cache AS
WITH alerts AS (
  SELECT
    tenant_id,
    tenant_name,
    rut,
    empresa_name,
    'EMPRESA'::text AS source,
    nivel_alerta_emision::text AS severity,
    CASE
      WHEN nivel_alerta_emision = 'SIN_EMISION' THEN 'Empresa sin emision'
      ELSE 'Empresa con alerta de emision'
    END AS title,
    concat(
      'Docs 2026: ', documentos_emitidos_2026::text,
      '. Dias sin emitir: ', coalesce(dias_sin_emitir::text, 'sin dato')
    ) AS detail,
    NULL::text AS entity_id,
    NULL::integer AS document_type,
    documentos_emitidos_2026::numeric AS metric_value,
    dias_sin_emitir::numeric AS metric_secondary,
    ultima_emision::text AS reference_date,
    now() AS generated_at
  FROM rr_gestion_soporte.empresa_control_resumen_cache
  WHERE nivel_alerta_emision <> 'OK'

  UNION ALL

  SELECT
    tenant_id,
    tenant_name,
    rut,
    empresa_name,
    'DEVICE'::text AS source,
    CASE
      WHEN nivel_alerta_emision <> 'OK' THEN nivel_alerta_emision::text
      ELSE 'WARNING'
    END AS severity,
    CASE
      WHEN nivel_alerta_emision <> 'OK' THEN 'Device con alerta de emision'
      ELSE 'Device con alerta de consistencia'
    END AS title,
    concat(
      'Device: ', coalesce(device_name, device_id),
      '. Consistencia: ', alerta_consistencia,
      '. Docs 2026: ', documentos_emitidos_2026::text
    ) AS detail,
    device_id::text AS entity_id,
    NULL::integer AS document_type,
    documentos_emitidos_2026::numeric AS metric_value,
    dias_sin_emitir::numeric AS metric_secondary,
    ultima_emision::text AS reference_date,
    now() AS generated_at
  FROM rr_gestion_soporte.device_control_resumen_cache
  WHERE nivel_alerta_emision <> 'OK'
     OR alerta_consistencia <> 'OK'

  UNION ALL

  SELECT
    tenant_id,
    tenant_name,
    rut,
    empresa_name,
    'FOLIOS'::text AS source,
    nivel_alerta_folios::text AS severity,
    'Folios requieren revision' AS title,
    concat(
      'Tipo DTE: ', document_type::text,
      '. Disponibles: ', folios_disponibles::text,
      '. Diferencia solicitados/rango: ', diferencia_solicitado_rango::text
    ) AS detail,
    NULL::text AS entity_id,
    document_type::integer AS document_type,
    folios_disponibles::numeric AS metric_value,
    diferencia_solicitado_rango::numeric AS metric_secondary,
    ultima_emision::text AS reference_date,
    now() AS generated_at
  FROM rr_gestion_soporte.folios_control_resumen_cache
  WHERE nivel_alerta_folios <> 'OK'

  UNION ALL

  SELECT
    tenant_id,
    tenant_name,
    rut,
    empresa_name,
    'AGOTAMIENTO'::text AS source,
    nivel_alerta_agotamiento::text AS severity,
    'Proyeccion de agotamiento' AS title,
    concat(
      'Tipo DTE: ', document_type::text,
      '. Disponibles: ', folios_disponibles::text,
      '. Dias 30d: ', coalesce(dias_hasta_agotar_30d::text, 'sin base'),
      '. Dias 90d: ', coalesce(dias_hasta_agotar_90d::text, 'sin base')
    ) AS detail,
    NULL::text AS entity_id,
    document_type::integer AS document_type,
    folios_disponibles::numeric AS metric_value,
    coalesce(dias_hasta_agotar_30d, dias_hasta_agotar_90d)::numeric AS metric_secondary,
    NULL::text AS reference_date,
    now() AS generated_at
  FROM rr_gestion_soporte.folios_proyeccion_agotamiento_cache
  WHERE nivel_alerta_agotamiento <> 'OK'

  UNION ALL

  SELECT
    tenant_id,
    tenant_name,
    rut,
    empresa_name,
    'CAF_VENCIMIENTO'::text AS source,
    CASE
      WHEN nivel_alerta_caf_vencimiento = 'SIN_FECHA_CAF' THEN 'REVISION_DATOS'
      ELSE nivel_alerta_caf_vencimiento
    END AS severity,
    'CAF factura electronica por vencer' AS title,
    concat(
      'Tipo DTE: ', document_type::text,
      '. CAF: ', coalesce(cafserial::text, 'sin serial'),
      '. FA: ', coalesce(caf_fecha_autorizacion::text, 'sin fecha'),
      '. Vence: ', coalesce(caf_fecha_vencimiento::text, 'sin fecha')
    ) AS detail,
    cafserial::text AS entity_id,
    document_type::integer AS document_type,
    caf_dias_para_vencer::numeric AS metric_value,
    NULL::numeric AS metric_secondary,
    caf_fecha_vencimiento::text AS reference_date,
    now() AS generated_at
  FROM rr_gestion_soporte.caf_vencimiento_cache
  WHERE document_type = 33
    AND nivel_alerta_caf_vencimiento IN ('URGENTE', 'WARNING', 'SIN_FECHA_CAF')
)
SELECT *
FROM alerts;

\echo 'creating_cache_indexes'

CREATE INDEX IF NOT EXISTS idx_doc_mensual_cache_tenant_rut
  ON rr_gestion_soporte.documentos_2026_mensual_cache (tenant_id, rut);

CREATE INDEX IF NOT EXISTS idx_doc_mensual_cache_tipo_periodo
  ON rr_gestion_soporte.documentos_2026_mensual_cache (tipodocumento, periodo);

CREATE INDEX IF NOT EXISTS idx_doc_device_mensual_cache_tenant_rut
  ON rr_gestion_soporte.documentos_2026_device_mensual_cache (tenant_id, rut);

CREATE INDEX IF NOT EXISTS idx_doc_device_mensual_cache_device
  ON rr_gestion_soporte.documentos_2026_device_mensual_cache (tenant_id, device_id);

CREATE INDEX IF NOT EXISTS idx_empresa_control_cache_alert
  ON rr_gestion_soporte.empresa_control_resumen_cache (nivel_alerta_emision, tenant_id, rut);

CREATE INDEX IF NOT EXISTS idx_device_control_cache_alert
  ON rr_gestion_soporte.device_control_resumen_cache (nivel_alerta_emision, alerta_consistencia, tenant_id, rut);

CREATE INDEX IF NOT EXISTS idx_folios_control_cache_alert
  ON rr_gestion_soporte.folios_control_resumen_cache (nivel_alerta_folios, tenant_id, rut, document_type);

CREATE INDEX IF NOT EXISTS idx_folios_agotamiento_cache_alert
  ON rr_gestion_soporte.folios_proyeccion_agotamiento_cache (nivel_alerta_agotamiento, tenant_id, rut, document_type);

CREATE INDEX IF NOT EXISTS idx_folios_rangos_cache_estado
  ON rr_gestion_soporte.folios_rangos_clasificados_cache (estado_operativo_rango, clasificacion_temporal);

CREATE INDEX IF NOT EXISTS idx_folios_rangos_cache_tenant_rut
  ON rr_gestion_soporte.folios_rangos_clasificados_cache (tenant_id, rut, document_type);

CREATE INDEX IF NOT EXISTS idx_folios_rangos_cache_caf_vencimiento
  ON rr_gestion_soporte.folios_rangos_clasificados_cache (nivel_alerta_caf_vencimiento, caf_fecha_vencimiento);

CREATE INDEX IF NOT EXISTS idx_caf_vencimiento_cache_alert
  ON rr_gestion_soporte.caf_vencimiento_cache (nivel_alerta_caf_vencimiento, document_type, tenant_id, rut);

CREATE INDEX IF NOT EXISTS idx_alertas_operativas_cache_main
  ON rr_gestion_soporte.alertas_operativas_cache (severity, source, tenant_id, rut);

CREATE INDEX IF NOT EXISTS idx_alertas_operativas_cache_source
  ON rr_gestion_soporte.alertas_operativas_cache (source, generated_at);

\echo 'analyze_caches'

ANALYZE rr_gestion_soporte.documentos_2026_mensual_cache;
ANALYZE rr_gestion_soporte.documentos_2026_device_mensual_cache;
ANALYZE rr_gestion_soporte.empresa_control_resumen_cache;
ANALYZE rr_gestion_soporte.device_control_resumen_cache;
ANALYZE rr_gestion_soporte.folios_control_resumen_cache;
ANALYZE rr_gestion_soporte.folios_proyeccion_agotamiento_cache;
ANALYZE rr_gestion_soporte.folios_rangos_clasificados_cache;
ANALYZE rr_gestion_soporte.caf_vencimiento_cache;
ANALYZE rr_gestion_soporte.alertas_operativas_cache;

\echo 'cache_counts'
SELECT 'documentos_2026_mensual_cache' AS cache_name, count(*)::bigint AS rows_count
FROM rr_gestion_soporte.documentos_2026_mensual_cache
UNION ALL
SELECT 'documentos_2026_device_mensual_cache', count(*)::bigint
FROM rr_gestion_soporte.documentos_2026_device_mensual_cache
UNION ALL
SELECT 'empresa_control_resumen_cache', count(*)::bigint
FROM rr_gestion_soporte.empresa_control_resumen_cache
UNION ALL
SELECT 'device_control_resumen_cache', count(*)::bigint
FROM rr_gestion_soporte.device_control_resumen_cache
UNION ALL
SELECT 'folios_control_resumen_cache', count(*)::bigint
FROM rr_gestion_soporte.folios_control_resumen_cache
UNION ALL
SELECT 'folios_proyeccion_agotamiento_cache', count(*)::bigint
FROM rr_gestion_soporte.folios_proyeccion_agotamiento_cache
UNION ALL
SELECT 'folios_rangos_clasificados_cache', count(*)::bigint
FROM rr_gestion_soporte.folios_rangos_clasificados_cache
UNION ALL
SELECT 'caf_vencimiento_cache', count(*)::bigint
FROM rr_gestion_soporte.caf_vencimiento_cache
UNION ALL
SELECT 'alertas_operativas_cache', count(*)::bigint
FROM rr_gestion_soporte.alertas_operativas_cache;

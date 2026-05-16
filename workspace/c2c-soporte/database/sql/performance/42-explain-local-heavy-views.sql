-- C2C Soporte - EXPLAIN seguro de vistas pesadas locales
-- Ejecutar conectado a la base local soporte.
-- Solo lectura. No apunta a public productivo.
-- Importante: usa EXPLAIN sin ANALYZE para no ejecutar completamente las consultas.

\echo 'explain_empresa_control_resumen'
EXPLAIN (FORMAT JSON)
SELECT *
FROM rr_gestion_soporte.empresa_control_resumen
ORDER BY
  CASE nivel_alerta_emision
    WHEN 'URGENTE' THEN 1
    WHEN 'SIN_EMISION' THEN 2
    WHEN 'WARNING' THEN 3
    ELSE 4
  END,
  dias_sin_emitir DESC NULLS FIRST,
  empresa_name ASC
LIMIT 25 OFFSET 0;

\echo 'explain_device_control_resumen'
EXPLAIN (FORMAT JSON)
SELECT *
FROM rr_gestion_soporte.device_control_resumen
ORDER BY
  CASE nivel_alerta_emision
    WHEN 'URGENTE' THEN 1
    WHEN 'SIN_EMISION' THEN 2
    WHEN 'WARNING' THEN 3
    ELSE 4
  END,
  CASE alerta_consistencia
    WHEN 'ACTIVO_SIN_EMISION' THEN 1
    WHEN 'ACTIVO_SIN_EMISION_RECIENTE' THEN 2
    WHEN 'NO_ACTIVO_CON_EMISION' THEN 3
    ELSE 4
  END,
  dias_sin_emitir DESC NULLS FIRST,
  empresa_name ASC NULLS LAST,
  device_name ASC NULLS LAST
LIMIT 25 OFFSET 0;

\echo 'explain_folios_control_resumen'
EXPLAIN (FORMAT JSON)
SELECT *
FROM rr_gestion_soporte.folios_control_resumen
ORDER BY
  CASE nivel_alerta_folios
    WHEN 'REVISION_DATOS' THEN 1
    WHEN 'SIN_FOLIOS' THEN 2
    WHEN 'URGENTE' THEN 3
    WHEN 'WARNING' THEN 4
    ELSE 5
  END,
  abs(diferencia_solicitado_rango) DESC,
  folios_disponibles ASC,
  empresa_name ASC NULLS LAST,
  document_type ASC
LIMIT 50 OFFSET 0;

\echo 'explain_folios_proyeccion_agotamiento'
EXPLAIN (FORMAT JSON)
SELECT *
FROM rr_gestion_soporte.folios_proyeccion_agotamiento
WHERE nivel_alerta_agotamiento <> 'OK'
ORDER BY
  CASE nivel_alerta_agotamiento
    WHEN 'URGENTE' THEN 1
    WHEN 'WARNING' THEN 2
    WHEN 'SIN_BASE_ESTIMACION' THEN 3
    ELSE 4
  END,
  folios_disponibles ASC
LIMIT 50 OFFSET 0;

\echo 'explain_folios_rangos_clasificados_detalle'
EXPLAIN (FORMAT JSON)
SELECT *
FROM rr_gestion_soporte.folios_rangos_clasificados_detalle
ORDER BY
  CASE estado_operativo_rango
    WHEN 'CADUCADO_CANDIDATO' THEN 1
    WHEN 'POR_OCUPAR' THEN 2
    WHEN 'EN_USO' THEN 3
    WHEN 'REVISION_DATOS' THEN 4
    WHEN 'AGOTADO' THEN 5
    ELSE 9
  END,
  CASE clasificacion_temporal
    WHEN 'RANGOANTERIOR' THEN 1
    WHEN 'RANGOACTUAL' THEN 2
    WHEN 'RANGOFUTURO' THEN 3
    ELSE 9
  END,
  lost_folios DESC,
  total_documentos_desocupados DESC,
  empresa_name ASC NULLS LAST,
  document_type ASC,
  folio_ini ASC
LIMIT 50 OFFSET 0;

\echo 'explain_documents_summary_global'
EXPLAIN (FORMAT JSON)
SELECT
  count(*)::bigint AS documents,
  count(DISTINCT tenant_id || '-' || rut::text)::bigint AS companies,
  count(DISTINCT device_id)::bigint AS devices,
  count(DISTINCT tipodocumento)::bigint AS document_types
FROM rr_gestion_soporte.documentos_2026;

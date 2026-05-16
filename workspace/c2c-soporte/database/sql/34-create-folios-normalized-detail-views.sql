-- C2C Soporte - vistas normalizadas detalle folios
-- Ejecutar conectado a la base local soporte.
-- No ejecutar en produccion.
-- No apunta a public. Solo crea o reemplaza vistas de lectura locales.

CREATE OR REPLACE VIEW rr_gestion_soporte.documentos_sin_caf_resumen AS
WITH documentos_sin_caf AS (
  SELECT
    d.tenant_id,
    d.rut,
    d.tipodocumento AS document_type,
    d.device_id,
    d.folio,
    d.fecha_emision,
    d.valortotal
  FROM rr_gestion_soporte.documentos_2026_normalizados d
  WHERE d.tenant_id IS NOT NULL
    AND d.rut IS NOT NULL
    AND d.tipodocumento IS NOT NULL
    AND d.folio IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM staging_public.caf c
      WHERE c.tenant_id = d.tenant_id
        AND c.rut = d.rut
        AND c.document_type = d.tipodocumento
        AND d.folio BETWEEN c.folio_ini AND c.folio_fin
    )
)
SELECT
  d.tenant_id,
  t.name AS tenant_name,
  d.rut,
  e.name AS empresa_name,
  d.document_type,
  count(*)::bigint AS documentos_sin_caf,
  count(DISTINCT d.device_id)::bigint AS devices_afectados,
  min(d.folio) AS primer_folio_sin_caf,
  max(d.folio) AS ultimo_folio_sin_caf,
  min(d.fecha_emision) AS primera_emision_sin_caf,
  max(d.fecha_emision) AS ultima_emision_sin_caf,
  sum(coalesce(d.valortotal, 0)) AS total_valor_sin_caf
FROM documentos_sin_caf d
LEFT JOIN staging_public.tenant t
  ON t.tenant_id = d.tenant_id
LEFT JOIN staging_public.empresa e
  ON e.tenant_id = d.tenant_id
 AND e.rut = d.rut
GROUP BY
  d.tenant_id,
  t.name,
  d.rut,
  e.name,
  d.document_type;

COMMENT ON VIEW rr_gestion_soporte.documentos_sin_caf_resumen IS
  'Documentos 2026 que no calzan con ningun rango CAF local por tenant, rut, tipo y folio.';

CREATE OR REPLACE VIEW rr_gestion_soporte.folios_rangos_clasificados_detalle AS
WITH uso_rango AS (
  SELECT
    c.tenant_id,
    c.rut,
    c.document_type,
    c.cafserial,
    c.folio_ini,
    c.folio_fin,
    count(d.*)::bigint AS total_ocupado,
    min(d.folio) AS primer_folio_emitido,
    max(d.folio) AS folio_mayor,
    max(d.fecha_emision) AS fecha_ultima_emision
  FROM staging_public.caf c
  LEFT JOIN rr_gestion_soporte.documentos_2026_normalizados d
    ON d.tenant_id = c.tenant_id
   AND d.rut = c.rut
   AND d.tipodocumento = c.document_type
   AND d.folio BETWEEN c.folio_ini AND c.folio_fin
  GROUP BY
    c.tenant_id,
    c.rut,
    c.document_type,
    c.cafserial,
    c.folio_ini,
    c.folio_fin
),
folio_mayor_global AS (
  SELECT
    tenant_id,
    rut,
    document_type,
    max(folio_mayor) AS folio_mayor_global
  FROM uso_rango
  WHERE folio_mayor IS NOT NULL
  GROUP BY tenant_id, rut, document_type
),
base AS (
  SELECT
    c.tenant_id,
    t.name AS tenant_name,
    c.rut,
    e.name AS empresa_name,
    c.document_type,
    c.cafserial,
    c.folio_ini,
    c.folio_fin,
    (c.folio_fin - c.folio_ini + 1)::bigint AS total_rango,
    c.created_at AS caf_created_at,
    coalesce(u.total_ocupado, 0)::bigint AS total_ocupado,
    u.primer_folio_emitido,
    u.folio_mayor,
    g.folio_mayor_global,
    u.fecha_ultima_emision
  FROM staging_public.caf c
  LEFT JOIN uso_rango u
    ON u.tenant_id = c.tenant_id
   AND u.rut = c.rut
   AND u.document_type = c.document_type
   AND u.cafserial = c.cafserial
   AND u.folio_ini = c.folio_ini
   AND u.folio_fin = c.folio_fin
  LEFT JOIN folio_mayor_global g
    ON g.tenant_id = c.tenant_id
   AND g.rut = c.rut
   AND g.document_type = c.document_type
  LEFT JOIN staging_public.tenant t
    ON t.tenant_id = c.tenant_id
  LEFT JOIN staging_public.empresa e
    ON e.tenant_id = c.tenant_id
   AND e.rut = c.rut
)
SELECT
  b.tenant_id,
  b.tenant_name,
  b.rut,
  b.empresa_name,
  b.document_type,
  b.cafserial,
  b.folio_ini,
  b.folio_fin,
  b.total_rango,
  b.caf_created_at,
  b.total_ocupado,
  greatest(b.total_rango - b.total_ocupado, 0)::bigint AS total_documentos_desocupados,
  b.primer_folio_emitido,
  b.folio_mayor,
  b.folio_mayor_global,
  b.fecha_ultima_emision,
  CASE
    WHEN b.total_ocupado = 0 THEN 'RANGOSINUSO'
    WHEN b.folio_mayor >= b.folio_fin THEN 'RANGOOCUPADO'
    WHEN b.total_ocupado >= b.total_rango THEN 'RANGOOCUPADO'
    ELSE 'RANGOCARGAPARCIAL'
  END AS estado_rango,
  CASE
    WHEN b.folio_mayor_global IS NULL AND b.total_ocupado = 0 THEN 'RANGOFUTURO'
    WHEN b.folio_mayor_global IS NULL THEN 'SINCLASIFICACION'
    WHEN b.folio_mayor_global BETWEEN b.folio_ini AND b.folio_fin THEN 'RANGOACTUAL'
    WHEN b.total_ocupado = 0 AND b.folio_ini > b.folio_mayor_global THEN 'RANGOFUTURO'
    WHEN b.folio_fin < b.folio_mayor_global THEN 'RANGOANTERIOR'
    ELSE 'SINCLASIFICACION'
  END AS clasificacion_temporal,
  'OK' AS caf_resultado,
  CASE
    WHEN b.folio_mayor_global IS NOT NULL
     AND b.folio_fin < b.folio_mayor_global
     AND b.total_ocupado < b.total_rango
     AND NOT (
       coalesce(b.folio_mayor >= b.folio_fin, false)
       OR b.total_ocupado >= b.total_rango
     )
      THEN greatest(b.total_rango - b.total_ocupado, 0)::bigint
    ELSE 0::bigint
  END AS lost_folios,
  CASE
    WHEN b.total_ocupado = 0
     AND b.caf_created_at::date <= current_date - interval '2 years' THEN 'CADUCADO_CANDIDATO'
    WHEN b.total_ocupado = 0 THEN 'POR_OCUPAR'
    WHEN b.folio_mayor >= b.folio_fin THEN 'AGOTADO'
    WHEN b.folio_mayor < b.folio_fin THEN 'EN_USO'
    ELSE 'REVISION_DATOS'
  END AS estado_operativo_rango
FROM base b;

COMMENT ON VIEW rr_gestion_soporte.folios_rangos_clasificados_detalle IS
  'Clasificacion local de rangos CAF inspirada en las funciones historicas rrv1, sin escrituras ni acceso a public.';

CREATE OR REPLACE VIEW rr_gestion_soporte.folios_resumen_empresa_extendido AS
WITH docs AS (
  SELECT
    tenant_id,
    rut,
    count(*)::bigint AS total_documentos,
    count(DISTINCT tipodocumento)::bigint AS total_tipos_documento,
    count(DISTINCT device_id)::bigint AS total_devices_con_documentos,
    min(folio) AS folio_min,
    max(folio) AS folio_max,
    min(fecha_emision) AS primera_emision,
    max(fecha_emision) AS ultima_emision,
    sum(coalesce(valortotal, 0)) AS total_valor_documentos
  FROM rr_gestion_soporte.documentos_2026_normalizados
  GROUP BY tenant_id, rut
),
caf AS (
  SELECT
    tenant_id,
    rut,
    count(*)::bigint AS total_rangos_caf,
    sum(total_rango)::bigint AS total_folios_autorizados,
    count(*) FILTER (WHERE total_ocupado > 0)::bigint AS total_rangos_utilizados,
    sum(total_ocupado)::bigint AS total_folios_utilizados_en_caf,
    sum(total_documentos_desocupados)::bigint AS total_folios_por_utilizar,
    sum(lost_folios)::bigint AS total_lost_folios,
    count(*) FILTER (WHERE estado_operativo_rango = 'CADUCADO_CANDIDATO')::bigint AS rangos_caducado_candidato,
    sum(total_rango) FILTER (WHERE estado_operativo_rango = 'CADUCADO_CANDIDATO')::bigint AS folios_caducado_candidato,
    count(*) FILTER (WHERE estado_operativo_rango = 'POR_OCUPAR')::bigint AS rangos_por_ocupar,
    count(*) FILTER (WHERE estado_operativo_rango = 'EN_USO')::bigint AS rangos_en_uso,
    count(*) FILTER (WHERE estado_operativo_rango = 'AGOTADO')::bigint AS rangos_agotados
  FROM rr_gestion_soporte.folios_rangos_clasificados_detalle
  GROUP BY tenant_id, rut
),
sin_caf AS (
  SELECT
    tenant_id,
    rut,
    sum(documentos_sin_caf)::bigint AS total_documentos_sin_caf,
    sum(devices_afectados)::bigint AS devices_con_documentos_sin_caf
  FROM rr_gestion_soporte.documentos_sin_caf_resumen
  GROUP BY tenant_id, rut
),
control AS (
  SELECT
    tenant_id,
    rut,
    sum(caf_count)::bigint AS total_caf,
    sum(folios_disponibles)::bigint AS total_folios_disponibles_registrados,
    count(*) FILTER (WHERE nivel_alerta_folios <> 'OK')::bigint AS alertas_folios
  FROM rr_gestion_soporte.folios_control_resumen
  GROUP BY tenant_id, rut
)
SELECT
  coalesce(d.tenant_id, c.tenant_id, s.tenant_id, ctl.tenant_id) AS tenant_id,
  t.name AS tenant_name,
  coalesce(d.rut, c.rut, s.rut, ctl.rut) AS rut,
  e.name AS empresa_name,
  coalesce(d.total_documentos, 0) AS total_documentos,
  coalesce(d.total_tipos_documento, 0) AS total_tipos_documento,
  coalesce(d.total_devices_con_documentos, 0) AS total_devices_con_documentos,
  d.folio_min,
  d.folio_max,
  d.primera_emision,
  d.ultima_emision,
  CASE
    WHEN d.ultima_emision IS NULL THEN NULL
    ELSE current_date - d.ultima_emision
  END AS dias_sin_emision,
  coalesce(d.total_valor_documentos, 0) AS total_valor_documentos,
  coalesce(ctl.total_caf, 0) AS total_caf,
  coalesce(c.total_rangos_caf, 0) AS total_rangos_caf,
  coalesce(c.total_folios_autorizados, 0) AS total_folios_autorizados,
  coalesce(c.total_folios_utilizados_en_caf, 0) AS total_folios_utilizados,
  coalesce(c.total_folios_por_utilizar, 0) AS total_folios_por_utilizar,
  coalesce(ctl.total_folios_disponibles_registrados, 0) AS total_folios_disponibles_registrados,
  coalesce(c.total_rangos_utilizados, 0) AS total_rangos_utilizados,
  coalesce(s.total_documentos_sin_caf, 0) AS total_documentos_sin_caf,
  coalesce(s.devices_con_documentos_sin_caf, 0) AS devices_con_documentos_sin_caf,
  coalesce(c.total_lost_folios, 0) AS total_lost_folios,
  coalesce(c.rangos_caducado_candidato, 0) AS rangos_caducado_candidato,
  coalesce(c.folios_caducado_candidato, 0) AS folios_caducado_candidato,
  coalesce(c.rangos_por_ocupar, 0) AS rangos_por_ocupar,
  coalesce(c.rangos_en_uso, 0) AS rangos_en_uso,
  coalesce(c.rangos_agotados, 0) AS rangos_agotados,
  coalesce(ctl.alertas_folios, 0) AS alertas_folios,
  CASE
    WHEN coalesce(s.total_documentos_sin_caf, 0) > 0 THEN 'REVISION_DATOS'
    WHEN coalesce(c.total_lost_folios, 0) > 0 THEN 'WARNING'
    WHEN coalesce(ctl.alertas_folios, 0) > 0 THEN 'WARNING'
    ELSE 'OK'
  END AS estado_resumen_empresa
FROM docs d
FULL JOIN caf c
  ON c.tenant_id = d.tenant_id
 AND c.rut = d.rut
FULL JOIN sin_caf s
  ON s.tenant_id = coalesce(d.tenant_id, c.tenant_id)
 AND s.rut = coalesce(d.rut, c.rut)
FULL JOIN control ctl
  ON ctl.tenant_id = coalesce(d.tenant_id, c.tenant_id, s.tenant_id)
 AND ctl.rut = coalesce(d.rut, c.rut, s.rut)
LEFT JOIN staging_public.tenant t
  ON t.tenant_id = coalesce(d.tenant_id, c.tenant_id, s.tenant_id, ctl.tenant_id)
LEFT JOIN staging_public.empresa e
  ON e.tenant_id = coalesce(d.tenant_id, c.tenant_id, s.tenant_id, ctl.tenant_id)
 AND e.rut = coalesce(d.rut, c.rut, s.rut, ctl.rut);

COMMENT ON VIEW rr_gestion_soporte.folios_resumen_empresa_extendido IS
  'Resumen extendido por empresa para soporte: documentos, CAF, rangos, documentos sin CAF y alertas.';

CREATE OR REPLACE VIEW rr_gestion_soporte.folios_resumen_device_extendido AS
WITH historial AS (
  SELECT
    tenant_id,
    rut,
    device_id,
    document_type,
    sum(cargas_historial)::bigint AS cargas_historial,
    sum(folios_entregados_por_rango)::bigint AS folios_entregados_por_rango,
    sum(folios_solicitados)::bigint AS folios_solicitados,
    sum(diferencia_solicitado_rango)::bigint AS diferencia_solicitado_rango
  FROM rr_gestion_soporte.folios_historial_resumen
  GROUP BY tenant_id, rut, device_id, document_type
)
SELECT
  c.tenant_id,
  c.tenant_name,
  c.rut,
  c.empresa_name,
  c.device_id,
  c.device_name,
  c.device_status,
  c.document_type,
  c.created_at,
  c.dias_desde_creacion,
  c.documentos_historicos,
  c.documentos_emitidos_2026,
  c.documentos_30d,
  c.documentos_90d,
  c.promedio_diario_30d,
  c.promedio_diario_90d,
  c.primera_emision,
  c.ultima_emision,
  c.primer_folio_emitido,
  c.ultimo_folio_emitido,
  c.dias_sin_emision,
  c.estado_operacional_cajero,
  coalesce(h.cargas_historial, 0) AS cargas_historial,
  coalesce(h.folios_entregados_por_rango, 0) AS folios_entregados_por_rango,
  coalesce(h.folios_solicitados, 0) AS folios_solicitados,
  coalesce(h.diferencia_solicitado_rango, 0) AS diferencia_solicitado_rango,
  CASE
    WHEN coalesce(h.diferencia_solicitado_rango, 0) <> 0 THEN 'REVISION_DATOS'
    WHEN c.estado_operacional_cajero IN ('PELIGRO', 'CRITICO', 'ALERTA') THEN c.estado_operacional_cajero
    ELSE 'OK'
  END AS estado_folios_device
FROM rr_gestion_soporte.cajero_control_resumen c
LEFT JOIN historial h
  ON h.tenant_id = c.tenant_id
 AND h.device_id = c.device_id
 AND (c.rut IS NULL OR h.rut = c.rut)
 AND (c.document_type IS NULL OR h.document_type = c.document_type);

COMMENT ON VIEW rr_gestion_soporte.folios_resumen_device_extendido IS
  'Resumen extendido por cajero/device combinando emision 2026, historial de folios y estado operacional.';

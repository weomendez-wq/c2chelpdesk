-- C2C Soporte - certificacion extendida SII / CAF documentos sin CAF
-- Ejecutar conectado a la base local soporte.
-- Solo lectura. No apunta a public y no modifica datos.
-- Esta verificacion puede tardar mas que la certificacion base porque revisa
-- documentos 2026 contra rangos CAF.

\echo '01_documentos_sin_caf_por_tipo'
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

\echo '02_documentos_sin_caf_top_empresas'
SELECT
  tenant_id,
  tenant_name,
  rut,
  empresa_name,
  document_type,
  documentos_sin_caf,
  devices_afectados,
  primer_folio_sin_caf,
  ultimo_folio_sin_caf,
  primera_emision_sin_caf,
  ultima_emision_sin_caf
FROM rr_gestion_soporte.documentos_sin_caf_resumen
WHERE document_type IN (33, 39, 41)
ORDER BY documentos_sin_caf DESC, devices_afectados DESC
LIMIT 50;

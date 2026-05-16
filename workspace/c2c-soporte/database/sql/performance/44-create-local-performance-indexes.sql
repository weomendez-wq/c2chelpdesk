-- C2C Soporte - indices locales de performance
-- Ejecutar conectado a la base local soporte.
-- No ejecutar en origen productivo.
-- No toca public. Crea indices solo en staging_public y rr_gestion_soporte.
--
-- Nota:
-- CREATE INDEX CONCURRENTLY no puede ejecutarse dentro de una transaccion explicita.
-- Este script esta pensado para psql directo.

\echo 'creating_document_indexes'

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_doc2026_01_tenant_rut_tipo
  ON staging_public.documentos_2026_01 (tenant_id, rut, tipodocumento);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_doc2026_02_tenant_rut_tipo
  ON staging_public.documentos_2026_02 (tenant_id, rut, tipodocumento);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_doc2026_03_tenant_rut_tipo
  ON staging_public.documentos_2026_03 (tenant_id, rut, tipodocumento);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_doc2026_04_tenant_rut_tipo
  ON staging_public.documentos_2026_04 (tenant_id, rut, tipodocumento);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_doc2026_05_tenant_rut_tipo
  ON staging_public.documentos_2026_05 (tenant_id, rut, tipodocumento);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_doc2026_01_tenant_device_tipo
  ON staging_public.documentos_2026_01 (tenant_id, device_id, tipodocumento);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_doc2026_02_tenant_device_tipo
  ON staging_public.documentos_2026_02 (tenant_id, device_id, tipodocumento);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_doc2026_03_tenant_device_tipo
  ON staging_public.documentos_2026_03 (tenant_id, device_id, tipodocumento);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_doc2026_04_tenant_device_tipo
  ON staging_public.documentos_2026_04 (tenant_id, device_id, tipodocumento);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_doc2026_05_tenant_device_tipo
  ON staging_public.documentos_2026_05 (tenant_id, device_id, tipodocumento);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_doc2026_01_folio_match
  ON staging_public.documentos_2026_01 (tenant_id, rut, tipodocumento, folio);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_doc2026_02_folio_match
  ON staging_public.documentos_2026_02 (tenant_id, rut, tipodocumento, folio);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_doc2026_03_folio_match
  ON staging_public.documentos_2026_03 (tenant_id, rut, tipodocumento, folio);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_doc2026_04_folio_match
  ON staging_public.documentos_2026_04 (tenant_id, rut, tipodocumento, folio);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_doc2026_05_folio_match
  ON staging_public.documentos_2026_05 (tenant_id, rut, tipodocumento, folio);

\echo 'creating_support_indexes'

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stg_empresa_tenant_rut
  ON staging_public.empresa (tenant_id, rut);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stg_tenant_tenant_id
  ON staging_public.tenant (tenant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stg_device_tenant_device
  ON staging_public.device (tenant_id, device_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stg_caf_tenant_rut_tipo
  ON staging_public.caf (tenant_id, rut, document_type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stg_caf_folio_range
  ON staging_public.caf (tenant_id, rut, document_type, folio_ini, folio_fin);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stg_foliosdisp_tenant_rut_tipo
  ON staging_public.foliosdisponibles (tenant_id, rut, document_type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stg_histfolios_tenant_rut_tipo
  ON staging_public.historialasignacionfolios (tenant_id, rut, document_type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stg_histfolios_tenant_device_tipo
  ON staging_public.historialasignacionfolios (tenant_id, device_id, document_type);

\echo 'creating_local_config_indexes'

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rr_hist_anual_tenant_rut_tipo
  ON rr_gestion_soporte.documentos_historial_anual_resumen (tenant_id, rut, tipodocumento);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rr_hist_anual_tenant_device_tipo
  ON rr_gestion_soporte.documentos_historial_anual_resumen (tenant_id, device_id, tipodocumento);

\echo 'analyze_local_tables'

ANALYZE staging_public.documentos_2026_01;
ANALYZE staging_public.documentos_2026_02;
ANALYZE staging_public.documentos_2026_03;
ANALYZE staging_public.documentos_2026_04;
ANALYZE staging_public.documentos_2026_05;
ANALYZE staging_public.empresa;
ANALYZE staging_public.tenant;
ANALYZE staging_public.device;
ANALYZE staging_public.caf;
ANALYZE staging_public.foliosdisponibles;
ANALYZE staging_public.historialasignacionfolios;
ANALYZE rr_gestion_soporte.documentos_historial_anual_resumen;

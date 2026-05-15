-- Plantilla de EXPLAIN para tablas especiales del bloque 2.
-- Uso exclusivo en origen con sesion read-only:
--   PGOPTIONS='-c default_transaction_read_only=on -c statement_timeout=30000 -c lock_timeout=5000'
--
-- No ejecutar EXPLAIN ANALYZE sin autorizacion explicita.

\pset pager off

\echo 'sincronizacionsap_full'
EXPLAIN (FORMAT JSON)
SELECT *
FROM public.sincronizacionsap;

\echo 'contabilizaciondocs_2026_fechaemision'
EXPLAIN (FORMAT JSON)
SELECT *
FROM public.contabilizaciondocs
WHERE fechaemision >= '2026-01-01'
  AND fechaemision < '2027-01-01';

\echo 'documentos_fecha_normalizada_2026'
EXPLAIN (FORMAT JSON)
SELECT *
FROM public.documentos_fecha_normalizada
WHERE fecha >= timestamp '2026-01-01'
  AND fecha < timestamp '2027-01-01';

\echo 'documentos_2026_fechaemision_directa'
EXPLAIN (FORMAT JSON)
SELECT *
FROM public.documentos
WHERE fechaemision >= '2026-01-01'
  AND fechaemision < '2027-01-01';

\echo 'documentos_2026_fechaemision_funcional'
EXPLAIN (FORMAT JSON)
SELECT *
FROM public.documentos
WHERE rr_gestion_soporte.fn_parse_dte_timestamp(fechaemision) >= timestamp '2026-01-01'
  AND rr_gestion_soporte.fn_parse_dte_timestamp(fechaemision) < timestamp '2027-01-01';

\echo 'enviosiidocs_join_documentos_2026_funcional'
EXPLAIN (FORMAT JSON)
SELECT e.*
FROM public.enviosiidocs e
JOIN public.documentos d
  ON d.rut = e.rut
 AND d.tipodocumento = e.tipodocumento
 AND d.folio = e.folio
WHERE rr_gestion_soporte.fn_parse_dte_timestamp(d.fechaemision) >= timestamp '2026-01-01'
  AND rr_gestion_soporte.fn_parse_dte_timestamp(d.fechaemision) < timestamp '2027-01-01';

\echo 'cierrecaja_documento_join_cierrecaja'
EXPLAIN (FORMAT JSON)
SELECT cd.*
FROM public.cierrecaja_documento cd
JOIN public.cierrecaja c
  ON c.cierrecaja_id = cd.cierrecaja_id;

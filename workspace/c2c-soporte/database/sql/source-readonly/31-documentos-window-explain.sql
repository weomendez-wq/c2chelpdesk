-- Plantilla de EXPLAIN para ventanas de public.documentos.
-- Uso exclusivo en origen con sesion read-only:
--   PGOPTIONS='-c default_transaction_read_only=on -c statement_timeout=30000 -c lock_timeout=5000'
--
-- No ejecutar EXPLAIN ANALYZE sin autorizacion explicita.
-- Ajustar las fechas del rango antes de ejecutar.

\pset pager off

\echo 'documentos_window_funcional'
EXPLAIN (FORMAT JSON)
SELECT *
FROM public.documentos
WHERE rr_gestion_soporte.fn_parse_dte_timestamp(fechaemision) >= timestamp '2026-05-01'
  AND rr_gestion_soporte.fn_parse_dte_timestamp(fechaemision) < timestamp '2026-06-01';

\echo 'documentos_window_directa_no_aprobada'
EXPLAIN (FORMAT JSON)
SELECT *
FROM public.documentos
WHERE fechaemision >= '2026-05-01'
  AND fechaemision < '2026-06-01';

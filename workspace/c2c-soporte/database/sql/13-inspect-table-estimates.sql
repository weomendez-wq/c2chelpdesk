-- C2C Soporte - estimaciones de tablas
-- Solo lectura. No ejecuta COUNT(*); usa estadisticas de pg_class.

SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  c.relkind AS relation_kind,
  c.reltuples::bigint AS estimated_rows,
  pg_size_pretty(pg_total_relation_size(c.oid)) AS total_size
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname IN ('staging_public', 'rr_gestion_soporte')
  AND c.relkind IN ('r', 'p', 'm', 'v')
ORDER BY n.nspname, c.relname;


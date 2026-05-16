-- C2C Soporte - medicion segura de objetos locales actuales
-- Ejecutar conectado a la base local soporte.
-- Solo lectura. No apunta a public productivo.
-- No usa EXPLAIN ANALYZE ni comandos de mantenimiento.

\echo 'performance_context'
SELECT
  current_database() AS database_name,
  current_user AS user_name,
  now() AS measured_at;

\echo 'local_relation_sizes'
SELECT
  n.nspname AS schema_name,
  c.relname AS relation_name,
  CASE c.relkind
    WHEN 'r' THEN 'table'
    WHEN 'p' THEN 'partitioned_table'
    WHEN 'v' THEN 'view'
    WHEN 'm' THEN 'materialized_view'
    ELSE c.relkind::text
  END AS relation_type,
  coalesce(s.n_live_tup, c.reltuples)::bigint AS estimated_rows,
  pg_size_pretty(pg_total_relation_size(c.oid)) AS total_size
FROM pg_class c
JOIN pg_namespace n
  ON n.oid = c.relnamespace
LEFT JOIN pg_stat_user_tables s
  ON s.relid = c.oid
WHERE n.nspname IN ('staging_public', 'rr_gestion_soporte')
  AND c.relkind IN ('r', 'p', 'v', 'm')
ORDER BY
  pg_total_relation_size(c.oid) DESC,
  n.nspname,
  c.relname;

\echo 'heavy_views_smoke_counts'
SELECT 'empresa_control_resumen' AS object_name, count(*)::bigint AS rows_count
FROM rr_gestion_soporte.empresa_control_resumen
UNION ALL
SELECT 'device_control_resumen', count(*)::bigint
FROM rr_gestion_soporte.device_control_resumen
UNION ALL
SELECT 'folios_control_resumen', count(*)::bigint
FROM rr_gestion_soporte.folios_control_resumen
UNION ALL
SELECT 'folios_proyeccion_agotamiento', count(*)::bigint
FROM rr_gestion_soporte.folios_proyeccion_agotamiento
UNION ALL
SELECT 'folios_rangos_clasificados_detalle', count(*)::bigint
FROM rr_gestion_soporte.folios_rangos_clasificados_detalle
UNION ALL
SELECT 'documentos_2026_normalizados', count(*)::bigint
FROM rr_gestion_soporte.documentos_2026_normalizados;

\echo 'documents_partition_counts'
SELECT 'documentos_2026_01' AS table_name, count(*)::bigint AS rows_count
FROM staging_public.documentos_2026_01
UNION ALL
SELECT 'documentos_2026_02', count(*)::bigint
FROM staging_public.documentos_2026_02
UNION ALL
SELECT 'documentos_2026_03', count(*)::bigint
FROM staging_public.documentos_2026_03
UNION ALL
SELECT 'documentos_2026_04', count(*)::bigint
FROM staging_public.documentos_2026_04
UNION ALL
SELECT 'documentos_2026_05', count(*)::bigint
FROM staging_public.documentos_2026_05;

\echo 'support_base_counts'
SELECT 'caf' AS table_name, count(*)::bigint AS rows_count
FROM staging_public.caf
UNION ALL
SELECT 'foliosdisponibles', count(*)::bigint
FROM staging_public.foliosdisponibles
UNION ALL
SELECT 'historialasignacionfolios', count(*)::bigint
FROM staging_public.historialasignacionfolios
UNION ALL
SELECT 'empresa', count(*)::bigint
FROM staging_public.empresa
UNION ALL
SELECT 'device', count(*)::bigint
FROM staging_public.device
UNION ALL
SELECT 'tenant', count(*)::bigint
FROM staging_public.tenant;

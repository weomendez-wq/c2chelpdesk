-- C2C Soporte - inspeccion de indices
-- Solo lectura. Ejecutar conectado a la base local soporte.

SELECT
  schemaname AS schema_name,
  tablename AS table_name,
  indexname AS index_name,
  indexdef AS index_definition
FROM pg_indexes
WHERE schemaname IN ('staging_public', 'rr_gestion_soporte')
ORDER BY schemaname, tablename, indexname;


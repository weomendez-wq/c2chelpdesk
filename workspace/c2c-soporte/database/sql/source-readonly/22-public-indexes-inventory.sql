-- C2C Soporte - inventario de indices origen public
-- Solo lectura. Ejecutar contra la base origen con public como solo lectura.

SELECT
  schemaname AS schema_name,
  tablename AS table_name,
  indexname AS index_name,
  indexdef AS index_definition
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;


-- C2C Soporte - inventario de tablas origen public
-- Solo lectura. Ejecutar contra la base origen con public como solo lectura.

SELECT
  c.table_schema,
  c.table_name,
  c.table_type
FROM information_schema.tables c
WHERE c.table_schema = 'public'
  AND c.table_type IN ('BASE TABLE', 'VIEW')
ORDER BY c.table_type, c.table_name;


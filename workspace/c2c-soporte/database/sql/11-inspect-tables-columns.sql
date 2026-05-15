-- C2C Soporte - inspeccion de tablas y columnas
-- Solo lectura. Ejecutar conectado a la base local soporte.

SELECT
  table_schema,
  table_name,
  ordinal_position,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema IN ('staging_public', 'rr_gestion_soporte')
ORDER BY table_schema, table_name, ordinal_position;


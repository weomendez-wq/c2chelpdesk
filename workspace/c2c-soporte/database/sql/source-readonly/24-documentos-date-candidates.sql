-- C2C Soporte - columnas candidatas de fecha para public.documentos
-- Solo lectura. Usar antes de definir ventana enero-fecha.

SELECT
  table_schema,
  table_name,
  ordinal_position,
  column_name,
  data_type,
  udt_name,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'documentos'
  AND (
    data_type IN ('date', 'timestamp without time zone', 'timestamp with time zone')
    OR column_name ILIKE '%fecha%'
    OR column_name ILIKE '%date%'
    OR column_name ILIKE '%created%'
    OR column_name ILIKE '%emision%'
  )
ORDER BY ordinal_position;


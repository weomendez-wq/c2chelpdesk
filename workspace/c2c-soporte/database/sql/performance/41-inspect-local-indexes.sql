-- C2C Soporte - inspeccion de indices locales actuales
-- Ejecutar conectado a la base local soporte.
-- Solo lectura. No apunta a public productivo.

\echo 'local_indexes'
SELECT
  schemaname AS schema_name,
  tablename AS table_name,
  indexname AS index_name,
  indexdef
FROM pg_indexes
WHERE schemaname IN ('staging_public', 'rr_gestion_soporte')
ORDER BY schemaname, tablename, indexname;

\echo 'candidate_columns_without_index_review'
WITH indexed_columns AS (
  SELECT
    ns.nspname AS schema_name,
    tbl.relname AS table_name,
    att.attname AS column_name
  FROM pg_index idx
  JOIN pg_class tbl
    ON tbl.oid = idx.indrelid
  JOIN pg_namespace ns
    ON ns.oid = tbl.relnamespace
  JOIN unnest(idx.indkey) WITH ORDINALITY AS cols(attnum, ord)
    ON true
  JOIN pg_attribute att
    ON att.attrelid = tbl.oid
   AND att.attnum = cols.attnum
  WHERE ns.nspname IN ('staging_public', 'rr_gestion_soporte')
)
SELECT
  c.table_schema AS schema_name,
  c.table_name,
  c.column_name,
  c.data_type,
  CASE WHEN i.column_name IS NULL THEN 'SIN_INDICE_DIRECTO' ELSE 'CON_INDICE_DIRECTO' END AS index_status
FROM information_schema.columns c
LEFT JOIN indexed_columns i
  ON i.schema_name = c.table_schema
 AND i.table_name = c.table_name
 AND i.column_name = c.column_name
WHERE c.table_schema IN ('staging_public', 'rr_gestion_soporte')
  AND c.column_name IN (
    'tenant_id',
    'rut',
    'tipodocumento',
    'document_type',
    'device_id',
    'folio',
    'folio_ini',
    'folio_fin',
    'periodo',
    'fechaemision',
    'fecha_emision',
    'estado_operativo_rango',
    'nivel_alerta_folios',
    'nivel_alerta_agotamiento'
  )
ORDER BY c.table_schema, c.table_name, c.column_name;

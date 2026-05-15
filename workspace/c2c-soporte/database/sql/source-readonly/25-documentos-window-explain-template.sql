-- C2C Soporte - plantilla EXPLAIN para ventana de public.documentos
-- Solo lectura. Reemplazar <columna_fecha> despues de revisar 24-documentos-date-candidates.sql.
-- No ejecutar sin reemplazar el placeholder.

EXPLAIN (FORMAT JSON)
SELECT *
FROM public.documentos
WHERE <columna_fecha> >= date_trunc('year', CURRENT_DATE)
  AND <columna_fecha> < CURRENT_DATE + INTERVAL '1 day';


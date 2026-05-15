-- C2C Soporte - verificacion vista documentos 2026
-- Ejecutar conectado a la base local soporte.

SELECT periodo, count(*) AS rows_count
FROM rr_gestion_soporte.documentos_2026
GROUP BY periodo
ORDER BY periodo;

SELECT count(*) AS total_rows
FROM rr_gestion_soporte.documentos_2026;

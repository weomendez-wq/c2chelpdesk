-- C2C Soporte - verificacion local
-- Ejecutar conectado a la base local soporte.

SELECT current_database() AS database_name;

SELECT schema_name
FROM information_schema.schemata
WHERE schema_name IN ('staging_public', 'rr_gestion_soporte')
ORDER BY schema_name;


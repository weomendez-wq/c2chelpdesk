-- C2C Soporte - inspeccion de schemas locales
-- Solo lectura. Ejecutar conectado a la base local soporte.

SELECT
  schema_name
FROM information_schema.schemata
WHERE schema_name IN ('staging_public', 'rr_gestion_soporte')
ORDER BY schema_name;


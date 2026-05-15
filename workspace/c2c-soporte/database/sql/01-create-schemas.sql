-- C2C Soporte - schemas locales
-- Ejecutar conectado a la base local soporte.
-- No ejecutar en produccion.

CREATE SCHEMA IF NOT EXISTS staging_public;
CREATE SCHEMA IF NOT EXISTS rr_gestion_soporte;

COMMENT ON SCHEMA staging_public IS
  'Copia local controlada de estructuras, datos permitidos, snapshots y staging.';

COMMENT ON SCHEMA rr_gestion_soporte IS
  'Objetos propios de gestion soporte: views, materialized views, metricas, helpers, control y logging.';


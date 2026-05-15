-- C2C Soporte - base local
-- Ejecutar conectado a una base administrativa, por ejemplo: postgres.
-- No ejecutar en produccion.

SELECT 'CREATE DATABASE soporte'
WHERE NOT EXISTS (
  SELECT 1
  FROM pg_database
  WHERE datname = 'soporte'
)\gexec


-- C2C Soporte - vistas base para soporte y frontend inicial
-- Ejecutar conectado a la base local soporte.
-- No ejecutar en produccion.

DROP VIEW IF EXISTS rr_gestion_soporte.empresa_dispositivo_resumen;
DROP VIEW IF EXISTS rr_gestion_soporte.dispositivos_resumen;
DROP VIEW IF EXISTS rr_gestion_soporte.empresas_resumen;

CREATE OR REPLACE VIEW rr_gestion_soporte.empresas_resumen AS
SELECT
  e.tenant_id,
  t.name AS tenant_name,
  t.tenant_role,
  t.status AS tenant_status,
  e.rut,
  e.name AS empresa_name,
  e.status AS empresa_status,
  e.giro,
  e.direccion,
  e.comuna,
  e.ciudad,
  e.email
FROM staging_public.empresa e
LEFT JOIN staging_public.tenant t
  ON t.tenant_id = e.tenant_id;

COMMENT ON VIEW rr_gestion_soporte.empresas_resumen IS
  'Resumen local de empresas con tenant asociado. Base para navegacion inicial del frontend.';

CREATE OR REPLACE VIEW rr_gestion_soporte.dispositivos_resumen AS
WITH registration_keys AS (
  SELECT
    tenant_id,
    count(*) AS registration_key_count,
    count(*) FILTER (WHERE status = 'active') AS active_registration_key_count,
    min(name) AS sample_registration_key_name
  FROM staging_public.deviceregistrationkey
  GROUP BY tenant_id
)
SELECT
  d.tenant_id,
  d.device_id,
  d.name AS device_name,
  d.status AS device_status,
  d.local,
  d.giro,
  d.direccion,
  d.comuna,
  d.ciudad,
  d.anydesk,
  d.observaciones,
  d.deviceconfiggroup_id,
  dcg.name AS config_group_name,
  dcg.status AS config_group_status,
  COALESCE(rk.registration_key_count, 0) AS registration_key_count,
  COALESCE(rk.active_registration_key_count, 0) AS active_registration_key_count,
  rk.sample_registration_key_name
FROM staging_public.device d
LEFT JOIN staging_public.deviceconfiggroup dcg
  ON dcg.deviceconfiggroup_id = d.deviceconfiggroup_id
LEFT JOIN registration_keys rk
  ON rk.tenant_id = d.tenant_id;

COMMENT ON VIEW rr_gestion_soporte.dispositivos_resumen IS
  'Resumen local de dispositivos con grupo de configuracion y clave de registro por tenant.';

CREATE OR REPLACE VIEW rr_gestion_soporte.empresa_dispositivo_resumen AS
SELECT
  e.tenant_id,
  e.tenant_name,
  e.rut,
  e.empresa_name,
  e.empresa_status,
  e.comuna AS empresa_comuna,
  e.ciudad AS empresa_ciudad,
  d.device_id,
  d.device_name,
  d.device_status,
  d.local AS device_local,
  d.comuna AS device_comuna,
  d.ciudad AS device_ciudad,
  d.anydesk,
  d.config_group_name,
  d.registration_key_count,
  d.active_registration_key_count
FROM rr_gestion_soporte.empresas_resumen e
LEFT JOIN rr_gestion_soporte.dispositivos_resumen d
  ON d.tenant_id = e.tenant_id;

COMMENT ON VIEW rr_gestion_soporte.empresa_dispositivo_resumen IS
  'Relacion empresa-dispositivo para primera navegacion del frontend.';

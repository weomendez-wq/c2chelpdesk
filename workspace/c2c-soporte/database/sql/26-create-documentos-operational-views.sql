-- C2C Soporte - vistas documentales operativas
-- Ejecutar conectado a la base local soporte.
-- No ejecutar en produccion.
-- Solo crea o reemplaza vistas de lectura.

CREATE OR REPLACE VIEW rr_gestion_soporte.documentos_2026_normalizados AS
SELECT
  periodo,
  folio,
  tenant_id,
  device_id,
  rut,
  tipodocumento,
  CASE
    WHEN fechaemision ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
      THEN fechaemision::date
    ELSE NULL
  END AS fecha_emision,
  receptorrut,
  receptordv,
  receptorrazonsocial,
  valortotal,
  valorneto,
  valoriva,
  valorefectivo,
  valortarjeta,
  valorexento,
  estado,
  estado_sii,
  ticket,
  horacliente,
  recepcionc2c,
  fechahora
FROM rr_gestion_soporte.documentos_2026;

COMMENT ON VIEW rr_gestion_soporte.documentos_2026_normalizados IS
  'Vista de lectura para documentos 2026 con fecha de emision parseada de forma controlada.';

CREATE OR REPLACE VIEW rr_gestion_soporte.documentos_2026_mensual AS
SELECT
  tenant_id,
  rut,
  tipodocumento,
  periodo,
  count(*) AS documentos,
  count(DISTINCT device_id) AS devices_con_emision,
  min(fecha_emision) AS primera_emision,
  max(fecha_emision) AS ultima_emision,
  sum(coalesce(valortotal, 0)) AS total_valor_documentos
FROM rr_gestion_soporte.documentos_2026_normalizados
GROUP BY
  tenant_id,
  rut,
  tipodocumento,
  periodo;

COMMENT ON VIEW rr_gestion_soporte.documentos_2026_mensual IS
  'Totales mensuales por tenant, rut y tipo de documento desde documentos_2026_normalizados.';

CREATE OR REPLACE VIEW rr_gestion_soporte.documentos_2026_device_mensual AS
SELECT
  tenant_id,
  device_id,
  rut,
  tipodocumento,
  periodo,
  count(*) AS documentos,
  min(fecha_emision) AS primera_emision,
  max(fecha_emision) AS ultima_emision,
  sum(coalesce(valortotal, 0)) AS total_valor_documentos
FROM rr_gestion_soporte.documentos_2026_normalizados
GROUP BY
  tenant_id,
  device_id,
  rut,
  tipodocumento,
  periodo;

COMMENT ON VIEW rr_gestion_soporte.documentos_2026_device_mensual IS
  'Totales mensuales por tenant, device, rut y tipo de documento desde documentos_2026_normalizados.';

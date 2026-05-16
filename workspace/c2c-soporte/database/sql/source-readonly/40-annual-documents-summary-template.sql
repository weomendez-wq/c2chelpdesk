-- C2C Soporte - plantilla resumen anual documentos origen public
-- Solo lectura. No ejecutar sin revisar ano, plan y ventana operacional.
-- Reemplazar <ANIO> antes de ejecutar.
--
-- Reglas:
-- - Ejecutar en sesion read-only.
-- - No usar INSERT/UPDATE/DELETE/DROP/ALTER/LOCK/REFRESH/CALL/DO.
-- - Exportar resultado agregado a CSV y cargarlo despues en la base local soporte.

BEGIN READ ONLY;

SET LOCAL statement_timeout = '15min';
SET LOCAL lock_timeout = '5s';
SET LOCAL idle_in_transaction_session_timeout = '2min';

SELECT
  <ANIO>::integer AS anio,
  tenant_id,
  rut,
  device_id,
  tipodocumento,
  count(*)::bigint AS documentos_emitidos,
  min(folio) AS primer_folio_emitido,
  max(folio) AS ultimo_folio_emitido,
  min(to_date(fechaemision, 'YYYY-MM-DD')) AS primera_emision,
  max(to_date(fechaemision, 'YYYY-MM-DD')) AS ultima_emision,
  sum(coalesce(valortotal, 0))::bigint AS valor_total_documentos
FROM public.documentos
WHERE fechaemision >= '<ANIO>-01-01'
  AND fechaemision <  '<ANIO_SIGUIENTE>-01-01'
  AND fechaemision ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
GROUP BY
  tenant_id,
  rut,
  device_id,
  tipodocumento
ORDER BY
  tenant_id,
  rut,
  device_id,
  tipodocumento;

COMMIT;

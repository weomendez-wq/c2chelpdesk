-- C2C Soporte - verificacion vista control empresa
-- Ejecutar conectado a la base local soporte.

SELECT
  count(*) AS empresas,
  count(*) FILTER (WHERE empresa_status = 'active') AS activas,
  count(*) FILTER (WHERE empresa_status <> 'active' OR empresa_status IS NULL) AS no_activas,
  count(*) = (
    count(*) FILTER (WHERE empresa_status = 'active')
    + count(*) FILTER (WHERE empresa_status <> 'active' OR empresa_status IS NULL)
  ) AS cuadratura_estado_ok
FROM rr_gestion_soporte.empresa_control_resumen;

SELECT
  empresa_status,
  count(*) AS empresas
FROM rr_gestion_soporte.empresa_control_resumen
GROUP BY empresa_status
ORDER BY empresa_status;

SELECT
  nivel_alerta_emision,
  count(*) AS empresas
FROM rr_gestion_soporte.empresa_control_resumen
GROUP BY nivel_alerta_emision
ORDER BY nivel_alerta_emision;

SELECT
  count(*) FILTER (WHERE documentos_emitidos_2026 = 0) AS empresas_sin_documentos,
  count(*) FILTER (WHERE documentos_emitidos_2026 > 0) AS empresas_con_documentos
FROM rr_gestion_soporte.empresa_control_resumen;

SELECT
  rut,
  empresa_name,
  empresa_status,
  documentos_emitidos_2026,
  primera_emision,
  ultima_emision,
  dias_sin_emitir,
  nivel_alerta_emision
FROM rr_gestion_soporte.empresa_control_resumen
ORDER BY
  CASE nivel_alerta_emision
    WHEN 'URGENTE' THEN 1
    WHEN 'SIN_EMISION' THEN 2
    WHEN 'WARNING' THEN 3
    ELSE 4
  END,
  dias_sin_emitir DESC NULLS FIRST,
  empresa_name ASC
LIMIT 20;

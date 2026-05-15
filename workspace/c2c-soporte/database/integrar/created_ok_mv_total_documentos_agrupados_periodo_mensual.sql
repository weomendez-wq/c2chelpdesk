-- View: rr_gestion_soporte.mv_total_documentos_agrupados_periodo_mensual


CREATE MATERIALIZED VIEW IF NOT EXISTS rr_gestion_soporte.mv_total_documentos_agrupados_periodo_mensual
TABLESPACE pg_default
AS
 SELECT tenant_id,
    date_trunc('month'::text, rr_gestion_soporte.gsoporte_safe_parse_timestamp(fechaemision::text))::date AS periodo,
    count(*) AS emitidos
   FROM documentos
  WHERE rr_gestion_soporte.gsoporte_safe_parse_timestamp(fechaemision::text) IS NOT NULL
  GROUP BY tenant_id, (date_trunc('month'::text, rr_gestion_soporte.gsoporte_safe_parse_timestamp(fechaemision::text)))
WITH DATA;

ALTER TABLE IF EXISTS rr_gestion_soporte.mv_total_documentos_agrupados_periodo_mensual
    OWNER TO master;

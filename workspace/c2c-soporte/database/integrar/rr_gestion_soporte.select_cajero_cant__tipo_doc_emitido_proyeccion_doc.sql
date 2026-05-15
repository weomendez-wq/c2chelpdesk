WITH consumo AS (

    SELECT
        dv.device_id,
        dv.tenant_id,
        dcg.deviceconfiggroup_id,
        d.tipodocumento,
        COUNT(*) / 30.0 AS avg_docs_dia

    FROM rr_gestion_soporte.gsoporte_device dv

    JOIN rr_gestion_soporte.gsoporte_deviceconfiggroup dcg
        ON dv.deviceconfiggroup_id = dcg.deviceconfiggroup_id
       AND dv.tenant_id = dcg.tenant_id

    JOIN documentos d
        ON d.device_id = dv.device_id
       AND d.tenant_id = dv.tenant_id

    WHERE rr_gestion_soporte.gsoporte_safe_parse_timestamp(d.fechaemision)
          >= now() - interval '30 days'

    GROUP BY
        dv.device_id,
        dv.tenant_id,
        dcg.deviceconfiggroup_id,
        d.tipodocumento
),

config AS (

    SELECT
        d.device_id,
        g.tenant_id,

        (f->>'tipodocumento')::int AS tipodocumento,
        (f->>'minimo')::int AS minimo,
        (f->>'pedir')::int AS pedir

    FROM rr_gestion_soporte.gsoporte_device d

    JOIN rr_gestion_soporte.gsoporte_deviceconfiggroup g
        ON g.deviceconfiggroup_id = d.deviceconfiggroup_id

    CROSS JOIN LATERAL json_array_elements(g.config->'folios') f
)

SELECT

    c.device_id,
    c.tipodocumento,

    c.avg_docs_dia,

    cf.folios_disponibles_reales,

    cfg.minimo,
    cfg.pedir,

    ROUND(
        cf.folios_disponibles_reales / NULLIF(c.avg_docs_dia,0)
    ,2) AS dias_hasta_agotar,

    ROUND(
        (cf.folios_disponibles_reales - cfg.minimo)
        / NULLIF(c.avg_docs_dia,0)
    ,2) AS dias_hasta_minimo,

    ROUND(
        cfg.pedir / NULLIF(c.avg_docs_dia,0)
    ,2) AS duracion_pedido_dias

FROM consumo c

JOIN config cfg
    ON cfg.device_id = c.device_id
   AND cfg.tipodocumento = c.tipodocumento

JOIN rr_gestion_soporte.mv_control_folios_all_tenants cf
    ON cf.tenant_id = c.tenant_id
   AND cf.document_type = c.tipodocumento

ORDER BY dias_hasta_minimo;
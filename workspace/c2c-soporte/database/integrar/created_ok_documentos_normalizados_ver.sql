
CREATE TABLE rr_gestion_soporte.dim_device (
    id BIGSERIAL PRIMARY KEY,
    device_id TEXT UNIQUE,
    tenant_id UUID,
    created_at TIMESTAMP,
    status TEXT
);


INSERT INTO rr_gestion_soporte.dim_device (device_id, tenant_id, created_at, status)
SELECT DISTINCT ON (LOWER(TRIM(d.device_id)))
    LOWER(TRIM(d.device_id)) AS device_id,
    d.tenant_id,
    d.created_at,
    d.status
FROM rr_gestion_soporte.gsoporte_device d
WHERE d.device_id IS NOT NULL
ORDER BY LOWER(TRIM(d.device_id)), d.created_at DESC
ON CONFLICT (device_id) DO UPDATE
SET 
    status = EXCLUDED.status,
    created_at = EXCLUDED.created_at;



CREATE INDEX idx_dim_device_device_id
ON rr_gestion_soporte.dim_device (device_id);

CREATE INDEX idx_dim_device_tenant
ON rr_gestion_soporte.dim_device (tenant_id);	


SELECT *
FROM documentos doc
LEFT JOIN rr_gestion_soporte.dim_device dd
    ON LOWER(TRIM(dd.device_id)) = LOWER(TRIM(doc.device_id))
WHERE dd.id IS NULL limit 10;



CREATE TABLE rr_gestion_soporte.fact_documentos_normalizados (
    id BIGSERIAL PRIMARY KEY, -- 🔥 NUEVO
    device_key BIGINT,
    tenant_id UUID,
    tipodocumento INT,
    fecha_emision TIMESTAMP,
    dia DATE,
    mes DATE,
    anio DATE
);


CREATE INDEX idx_fact_docs_main
ON rr_gestion_soporte.fact_documentos_normalizados (tenant_id, mes);

CREATE INDEX idx_fact_docs_device
ON rr_gestion_soporte.fact_documentos_normalizados (device_key);

CREATE INDEX idx_fact_docs_tipo
ON rr_gestion_soporte.fact_documentos_normalizados (tipodocumento);


INSERT INTO rr_gestion_soporte.fact_documentos_normalizados (
    device_key,
    tenant_id,
    tipodocumento,
    fecha_emision,
    dia,
    mes,
    anio
)
SELECT
    dd.id AS device_key,
    doc.tenant_id,
    doc.tipodocumento,
    f.fecha_emision,
    date_trunc('day', f.fecha_emision),
    date_trunc('month', f.fecha_emision),
    date_trunc('year', f.fecha_emision)
FROM documentos doc

JOIN rr_gestion_soporte.dim_device dd
    ON dd.device_id = LOWER(TRIM(doc.device_id))

CROSS JOIN LATERAL (
    SELECT rr_gestion_soporte.gsoporte_safe_parse_timestamp(doc.fechaemision::text) AS fecha_emision
) f

WHERE doc.fechaemision IS NOT NULL;


SELECT COUNT(*) 
FROM rr_gestion_soporte.fact_documentos_normalizados;


SELECT *
FROM rr_gestion_soporte.fact_documentos_normalizados
LIMIT 10;




CREATE TABLE rr_gestion_soporte.fact_docs_aggregados (
    tenant_id UUID,
    device_key BIGINT,
    tipodocumento INT,
    periodo_emision DATE,
    documentos INT,
    PRIMARY KEY (tenant_id, device_key, tipodocumento, periodo_emision)
);


INSERT INTO rr_gestion_soporte.fact_docs_aggregados
SELECT
    tenant_id,
    device_key,
    tipodocumento,
    mes AS periodo_emision,
    COUNT(*) AS documentos
FROM rr_gestion_soporte.fact_documentos_normalizados
GROUP BY tenant_id, device_key, tipodocumento, mes;


CREATE INDEX idx_fact_agg_main
ON rr_gestion_soporte.fact_docs_aggregados (tenant_id, periodo_emision);



CREATE MATERIALIZED VIEW rr_gestion_soporte.mv_actividad_cajeros AS
SELECT
    f.tenant_id,
    f.device_key,

    MIN(f.periodo_emision) AS primera_emision,
    MAX(f.periodo_emision) AS ultima_emision,

    CURRENT_DATE - MAX(f.periodo_emision) AS dias_sin_emision,

    CASE 
        WHEN CURRENT_DATE - MAX(f.periodo_emision) > 7 THEN 'ATENCION'
        ELSE 'NORMAL'
    END AS estado

FROM rr_gestion_soporte.fact_docs_aggregados f
GROUP BY f.tenant_id, f.device_key;



CREATE INDEX idx_mv_actividad
ON rr_gestion_soporte.mv_actividad_cajeros (tenant_id, device_key);




CREATE MATERIALIZED VIEW rr_gestion_soporte.mv_metricas_cajeros AS
WITH base AS (
    SELECT
        tenant_id,
        device_key,
        COUNT(DISTINCT periodo_emision) AS periodos,
        SUM(documentos) AS total_docs
    FROM rr_gestion_soporte.fact_docs_aggregados
    GROUP BY tenant_id, device_key
)
SELECT
    tenant_id,
    device_key,
    total_docs,
    periodos,

    CASE 
        WHEN periodos >= 12 THEN total_docs / periodos -- anual
        WHEN periodos >= 1 THEN total_docs / periodos -- mensual
        ELSE total_docs
    END AS promedio

FROM base;



SELECT
    d.device_id,
    d.tenant_id,
    d.status,

    a.estado,
    a.dias_sin_emision,

    m.total_docs,
    m.promedio

FROM rr_gestion_soporte.dim_device d

LEFT JOIN rr_gestion_soporte.mv_actividad_cajeros a
    ON a.device_key = d.id

LEFT JOIN rr_gestion_soporte.mv_metricas_cajeros m
    ON m.device_key = d.id

WHERE d.tenant_id = '767b1169-d1f5-4ecc-ba8a-21700c5a3e2c';



SELECT
    COUNT(*) AS total_cajeros,
    COUNT(*) FILTER (WHERE estado = 'NORMAL') AS normales,
    COUNT(*) FILTER (WHERE estado = 'ATENCION') AS atencion
FROM rr_gestion_soporte.mv_actividad_cajeros
WHERE tenant_id = '767b1169-d1f5-4ecc-ba8a-21700c5a3e2c';



REFRESH MATERIALIZED VIEW rr_gestion_soporte.mv_actividad_cajeros;
REFRESH MATERIALIZED VIEW rr_gestion_soporte.mv_metricas_cajeros;


SELECT * 
FROM rr_gestion_soporte.mv_actividad_cajeros 
LIMIT 10;


SELECT
    d.device_id,
    d.status,
    
    m.total_docs,
    m.periodos,
    m.promedio,

    a.estado,
    a.dias_sin_emision,

    RANK() OVER (ORDER BY m.total_docs DESC) AS ranking

FROM rr_gestion_soporte.mv_metricas_cajeros m

JOIN rr_gestion_soporte.dim_device d
    ON d.id = m.device_key

LEFT JOIN rr_gestion_soporte.mv_actividad_cajeros a
    ON a.device_key = m.device_key

WHERE m.total_docs > 0 -- 🔥 evita ceros (punto 8)

ORDER BY ranking;




WITH base AS (
    SELECT
        f.tenant_id,
        f.device_key,
        SUM(f.documentos) AS total_docs,
        COUNT(DISTINCT f.periodo_emision) AS periodos
    FROM rr_gestion_soporte.fact_docs_aggregados f
    WHERE f.tenant_id = '767b1169-d1f5-4ecc-ba8a-21700c5a3e2c'
    AND f.periodo_emision >= date_trunc('month', CURRENT_DATE) -- 🔥 dinámico
    GROUP BY f.tenant_id, f.device_key
),
metricas AS (
    SELECT
        b.*,
        CASE 
            WHEN b.periodos >= 12 THEN b.total_docs / b.periodos
            WHEN b.periodos >= 1 THEN b.total_docs / b.periodos
            ELSE 0
        END AS promedio
    FROM base b
)
SELECT
    d.device_id,
    m.total_docs,
    m.promedio,
    RANK() OVER (ORDER BY m.total_docs DESC) AS ranking
FROM metricas m
JOIN rr_gestion_soporte.dim_device d
    ON d.id = m.device_key
WHERE m.total_docs > 0
ORDER BY ranking;

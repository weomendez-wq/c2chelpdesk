
CREATE TABLE rr_gestion_soporte.fact_documentos_normalizados (
    device_key BIGINT, -- ✅ CORRECTO
    tenant_id UUID,
    tipodocumento INT,
    fecha_emision TIMESTAMP,
    dia DATE,
    mes DATE,
    anio DATE,
    PRIMARY KEY (tenant_id, device_key, fecha_emision, tipodocumento)
);


CREATE INDEX idx_fact_docs_mes
ON rr_gestion_soporte.fact_documentos_normalizados (tenant_id, mes);

CREATE INDEX idx_fact_docs_device
ON rr_gestion_soporte.fact_documentos_normalizados (device_key);

CREATE INDEX idx_fact_docs_fecha
ON rr_gestion_soporte.fact_documentos_normalizados (fecha_emision);


CREATE TABLE rr_gestion_soporte.dim_device (
    id BIGSERIAL PRIMARY KEY,
    device_id TEXT UNIQUE,
    tenant_id UUID,
    created_at TIMESTAMP,
    status TEXT
);


CREATE INDEX idx_dim_device_device_id
ON rr_gestion_soporte.dim_device (device_id);

CREATE INDEX idx_dim_device_tenant
ON rr_gestion_soporte.dim_device (tenant_id);


INSERT INTO rr_gestion_soporte.dim_device (device_id, tenant_id, created_at, status)
SELECT DISTINCT ON (d.device_id)
    d.device_id,
    d.tenant_id,
    d.created_at,
    d.status
FROM rr_gestion_soporte.gsoporte_device d
ORDER BY d.device_id, d.created_at DESC
ON CONFLICT (device_id) DO UPDATE
SET 
    status = EXCLUDED.status,
    created_at = EXCLUDED.created_at;


	SELECT COUNT(*) 
FROM rr_gestion_soporte.fact_documentos_normalizados;


INSERT INTO rr_gestion_soporte.fact_documentos_normalizados
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
    ON dd.device_id = doc.device_id

CROSS JOIN LATERAL (
    SELECT rr_gestion_soporte.gsoporte_safe_parse_timestamp(doc.fechaemision::text) AS fecha_emision
) f

WHERE doc.fechaemision IS NOT NULL

ON CONFLICT DO NOTHING;




SELECT COUNT(*) 
FROM rr_gestion_soporte.fact_documentos_normalizados;


SELECT *
FROM rr_gestion_soporte.fact_documentos_normalizados
LIMIT 10;


SELECT COUNT(*)
FROM documentos doc
LEFT JOIN rr_gestion_soporte.dim_device dd
    ON dd.device_id = doc.device_id
WHERE dd.id IS NULL;


EXPLAIN ANALYZE
SELECT COUNT(*)
FROM rr_gestion_soporte.fact_documentos_normalizados;



SELECT
    doc.device_id,
    doc.tenant_id,
    doc.tipodocumento,
    rr_gestion_soporte.gsoporte_safe_parse_timestamp(doc.fechaemision::text) AS fecha_emision,
    COUNT(*)
FROM documentos doc
WHERE doc.fechaemision IS NOT NULL
GROUP BY 1,2,3,4
HAVING COUNT(*) > 1;



INSERT INTO rr_gestion_soporte.fact_documentos_normalizados
SELECT
    doc.device_id,
    doc.tenant_id,
    doc.tipodocumento,
    rr_gestion_soporte.gsoporte_safe_parse_timestamp(doc.fechaemision::text),
    date_trunc('day', rr_gestion_soporte.gsoporte_safe_parse_timestamp(doc.fechaemision::text)),
    date_trunc('month', rr_gestion_soporte.gsoporte_safe_parse_timestamp(doc.fechaemision::text)),
    date_trunc('year', rr_gestion_soporte.gsoporte_safe_parse_timestamp(doc.fechaemision::text))
FROM documentos doc
WHERE doc.fechaemision IS NOT NULL;

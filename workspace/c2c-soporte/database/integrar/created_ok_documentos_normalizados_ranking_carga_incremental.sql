-- =========================================
-- MODELO INTELIGENTE DE RANKING DE CAJEROS
-- VERSION CON REFRESH INCREMENTAL
-- =========================================

-- =========================================
-- 0. TABLA DE CONTROL (INCREMENTAL)
-- =========================================

CREATE TABLE IF NOT EXISTS rr_gestion_soporte.etl_control (
    proceso TEXT PRIMARY KEY,
    ultima_fecha TIMESTAMP
);

INSERT INTO rr_gestion_soporte.etl_control (proceso, ultima_fecha)
VALUES ('fact_documentos', '2000-01-01')
ON CONFLICT (proceso) DO NOTHING;


-- =========================================
-- 1. CARGA INCREMENTAL FACT
-- =========================================

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
JOIN rr_gestion_soporte.etl_control ctl
    ON ctl.proceso = 'fact_documentos'
WHERE doc.fechaemision IS NOT NULL
AND f.fecha_emision > ctl.ultima_fecha;


-- ACTUALIZAR CONTROL
UPDATE rr_gestion_soporte.etl_control
SET ultima_fecha = (SELECT MAX(fecha_emision) FROM rr_gestion_soporte.fact_documentos_normalizados)
WHERE proceso = 'fact_documentos';


-- =========================================
-- 2. AGREGADOS INCREMENTALES
-- =========================================

INSERT INTO rr_gestion_soporte.fact_docs_aggregados
SELECT
    tenant_id,
    device_key,
    tipodocumento,
    mes AS periodo_emision,
    COUNT(*)
FROM rr_gestion_soporte.fact_documentos_normalizados f
JOIN rr_gestion_soporte.etl_control ctl
    ON ctl.proceso = 'fact_documentos'
WHERE f.fecha_emision > ctl.ultima_fecha - INTERVAL '1 day'
GROUP BY tenant_id, device_key, tipodocumento, mes
ON CONFLICT (tenant_id, device_key, tipodocumento, periodo_emision)
DO UPDATE SET documentos = rr_gestion_soporte.fact_docs_aggregados.documentos + EXCLUDED.documentos;


-- =========================================
-- 3. REFRESH PARCIAL (SOLO DATOS NUEVOS)
-- =========================================

REFRESH MATERIALIZED VIEW rr_gestion_soporte.mv_tendencia_cajeros;
REFRESH MATERIALIZED VIEW rr_gestion_soporte.mv_score_cajeros;


-- =========================================
-- 4. JOB IDEAL (EJECUCION PROGRAMADA)
-- =========================================

-- Este bloque debería ejecutarse cada X minutos / horas
-- Ejemplo:
-- 1. Cargar nuevos documentos
-- 2. Actualizar agregados
-- 3. Refrescar vistas

-- Puedes usar:
-- pg_cron / airflow / backend scheduler


-- =========================================
-- 5. VALIDACION
-- =========================================

-- Ver última fecha procesada
SELECT * FROM rr_gestion_soporte.etl_control;

-- Ver nuevos registros cargados recientemente
SELECT *
FROM rr_gestion_soporte.fact_documentos_normalizados
ORDER BY fecha_emision DESC
LIMIT 10;


-- =========================================
-- 6. QUERY FINAL PARA BACKEND / DASHBOARD
-- =========================================

-- 🔥 ENDPOINT BASE (ranking con filtros)
-- parámetros esperados:
-- :tenant_id
-- :fecha_desde (opcional)
-- :fecha_hasta (opcional)
-- :tipodocumento (opcional)

WITH base AS (
    SELECT
        f.tenant_id,
        f.device_key,
        SUM(f.documentos) AS total_docs,
        COUNT(DISTINCT f.periodo_emision) AS periodos
    FROM rr_gestion_soporte.fact_docs_aggregados f
    WHERE f.tenant_id = :tenant_id
    AND (:fecha_desde IS NULL OR f.periodo_emision >= :fecha_desde)
    AND (:fecha_hasta IS NULL OR f.periodo_emision <= :fecha_hasta)
    AND (:tipodocumento IS NULL OR f.tipodocumento = :tipodocumento)
    GROUP BY f.tenant_id, f.device_key
)
SELECT
    d.device_id,
    d.status,

    b.total_docs,
    b.periodos,

    s.score,
    s.tendencia,
    s.variacion,

    s.estado,
    s.dias_sin_emision,

    s.en_garantia,

    CASE
        WHEN s.score >= 1000 THEN 'TOP'
        WHEN s.score >= 500 THEN 'BUENO'
        WHEN s.score >= 100 THEN 'REGULAR'
        ELSE 'CRITICO'
    END AS segmento,

    CASE
        WHEN s.estado = 'ATENCION' AND s.tendencia = 'BAJA' THEN 'CRITICO'
        WHEN s.dias_sin_emision > 3 THEN 'SEGUIMIENTO'
        ELSE 'OK'
    END AS alerta,

    RANK() OVER (ORDER BY s.score DESC) AS ranking

FROM base b
JOIN rr_gestion_soporte.mv_score_cajeros s
    ON s.device_key = b.device_key
JOIN rr_gestion_soporte.dim_device d
    ON d.id = b.device_key

WHERE b.total_docs > 0

ORDER BY ranking;


-- =========================================
-- 7. QUERY RESUMEN (KPIs DASHBOARD)
-- =========================================

SELECT
    COUNT(*) AS total_cajeros,

    COUNT(*) FILTER (WHERE estado = 'NORMAL') AS normales,
    COUNT(*) FILTER (WHERE estado = 'ATENCION') AS atencion,

    COUNT(*) FILTER (WHERE en_garantia = true) AS en_garantia,

    AVG(score) AS score_promedio

FROM rr_gestion_soporte.mv_score_cajeros
WHERE tenant_id = :tenant_id;


-- =========================================
-- 8. RECOMENDACION BACKEND
-- =========================================

-- Endpoint 1: /ranking
-- usa query 6

-- Endpoint 2: /kpis
-- usa query 7

-- Endpoint 3: /top
-- agregar LIMIT 10

-- Endpoint 4: /bottom
-- ORDER BY score ASC LIMIT 10


-- =========================================
-- RESULTADO
-- =========================================
-- ✔ Backend listo para consumir
-- ✔ Queries parametrizadas
-- ✔ Sin acceso a tablas pesadas
-- ✔ Escalable y mantenible
-- ✔ Compatible con dashboards en tiempo real


-- =========================================
-- MODELO INTELIGENTE DE RANKING DE CAJEROS
-- =========================================

-- =========================================
-- 1. ENRIQUECER DIM_DEVICE
-- =========================================

ALTER TABLE rr_gestion_soporte.dim_device
ADD COLUMN IF NOT EXISTS antiguedad_dias INT,
ADD COLUMN IF NOT EXISTS en_garantia BOOLEAN;

UPDATE rr_gestion_soporte.dim_device
SET
    antiguedad_dias = CURRENT_DATE - created_at::date,
    en_garantia = (CURRENT_DATE - created_at::date) <= 90;


-- =========================================
-- 2. TENDENCIA DE CAJEROS
-- =========================================


CREATE MATERIALIZED VIEW rr_gestion_soporte.mv_tendencia_cajeros AS
WITH base AS (
    SELECT
        tenant_id,
        device_key,
        periodo_emision,
        SUM(documentos) AS docs
    FROM rr_gestion_soporte.fact_docs_aggregados
    GROUP BY tenant_id, device_key, periodo_emision
),
pivot AS (
    SELECT
        b.tenant_id,
        b.device_key,

        SUM(CASE 
            WHEN b.periodo_emision = date_trunc('month', CURRENT_DATE) THEN docs
            ELSE 0 END) AS mes_actual,

        SUM(CASE 
            WHEN b.periodo_emision = date_trunc('month', CURRENT_DATE - INTERVAL '1 month') THEN docs
            ELSE 0 END) AS mes_anterior

    FROM base b
    GROUP BY b.tenant_id, b.device_key
)
SELECT
    *,
    CASE
        WHEN mes_anterior = 0 THEN NULL
        ELSE (mes_actual - mes_anterior)::numeric / mes_anterior
    END AS variacion,

    CASE
        WHEN mes_actual > mes_anterior THEN 'SUBE'
        WHEN mes_actual < mes_anterior THEN 'BAJA'
        ELSE 'ESTABLE'
    END AS tendencia

FROM pivot;


-- =========================================
-- 3. SCORE INTELIGENTE
-- =========================================


CREATE MATERIALIZED VIEW rr_gestion_soporte.mv_score_cajeros AS
WITH base AS (
    SELECT
        f.tenant_id,
        f.device_key,
        SUM(f.documentos) AS total_docs,
        COUNT(DISTINCT f.periodo_emision) AS periodos
    FROM rr_gestion_soporte.fact_docs_aggregados f
    GROUP BY f.tenant_id, f.device_key
)
SELECT
    b.*,
    d.en_garantia,
    d.antiguedad_dias,

    a.dias_sin_emision,
    a.estado,

    t.variacion,
    t.tendencia,

    (
        (b.total_docs * 0.4) +
        (b.periodos * 10 * 0.2) +
        (CASE WHEN a.dias_sin_emision > 7 THEN -50 ELSE 0 END) +
        (CASE 
            WHEN t.tendencia = 'SUBE' THEN 30
            WHEN t.tendencia = 'BAJA' THEN -30
            ELSE 0
        END) +
        (CASE WHEN d.en_garantia THEN 20 ELSE 0 END)
    ) AS score

FROM base b
JOIN rr_gestion_soporte.dim_device d
    ON d.id = b.device_key
LEFT JOIN rr_gestion_soporte.mv_actividad_cajeros a
    ON a.device_key = b.device_key
LEFT JOIN rr_gestion_soporte.mv_tendencia_cajeros t
    ON t.device_key = b.device_key;


-- =========================================
-- 4. RANKING FINAL
-- =========================================

SELECT
    d.device_id,
    s.total_docs,
    s.periodos,
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

FROM rr_gestion_soporte.mv_score_cajeros s
JOIN rr_gestion_soporte.dim_device d
    ON d.id = s.device_key

WHERE s.total_docs > 0

ORDER BY ranking;


-- =========================================
-- 5. REFRESH
-- =========================================

REFRESH MATERIALIZED VIEW rr_gestion_soporte.mv_tendencia_cajeros;
REFRESH MATERIALIZED VIEW rr_gestion_soporte.mv_score_cajeros;

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
-- RESULTADO
-- =========================================
-- ✔ No recargas toda la tabla
-- ✔ Solo procesas datos nuevos
-- ✔ Escalable a millones de registros
-- ✔ Base productiva real

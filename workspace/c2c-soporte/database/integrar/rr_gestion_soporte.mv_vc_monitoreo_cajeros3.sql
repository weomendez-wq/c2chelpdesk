-- =========================================
-- MATERIALIZED VIEW: MONITOREO CAJEROS
-- =========================================

CREATE MATERIALIZED VIEW rr_gestion_soporte.mv_monitoreo_cajeros
AS

WITH devices AS (
    SELECT
        d.device_id,
        d.tenant_id,
        d.created_at,
        d.status
    FROM rr_gestion_soporte.gsoporte_device d
),

docs_parseados AS (
    SELECT
        doc.device_id,
        doc.tenant_id,
        doc.rut,
        rr_gestion_soporte.gsoporte_safe_parse_timestamp(doc.fechaemision::text) AS fecha_emision
    FROM documentos doc
),

docs_validos AS (
    SELECT *
    FROM docs_parseados
    WHERE fecha_emision IS NOT NULL
),

rut_por_device AS (
    SELECT
        device_id,
        tenant_id,
        MAX(rut) AS rut
    FROM docs_validos
    GROUP BY device_id, tenant_id
),

docs_intervalo AS (
    SELECT *
    FROM docs_validos
    WHERE fecha_emision >= NOW() - INTERVAL '4 months'
),

docs_mes AS (
    SELECT
        device_id,
        tenant_id,
        date_trunc('month', fecha_emision) AS periodo_emision,
        COUNT(*) AS documentos_mes
    FROM docs_intervalo
    GROUP BY device_id, tenant_id, date_trunc('month', fecha_emision)
),

actividad_cajero AS (
    SELECT
        device_id,
        tenant_id,
        MIN(fecha_emision) AS primera_emision,
        MAX(fecha_emision) AS ultima_emision
    FROM docs_validos
    GROUP BY device_id, tenant_id
),

estadisticas_cajero AS (
    SELECT
        device_id,
        tenant_id,
        AVG(documentos_mes) AS promedio_mensual_cajero,
        SUM(documentos_mes) AS total_periodos_cajero
    FROM docs_mes
    GROUP BY device_id, tenant_id
),

ranking_mensual AS (
    SELECT
        dm.*,
        DENSE_RANK() OVER (
            PARTITION BY periodo_emision
            ORDER BY documentos_mes DESC
        ) AS ranking_mensual
    FROM docs_mes dm
),

total_cajeros AS (
    SELECT
        tenant_id,
        COUNT(*) AS total_cajeros
    FROM devices
    GROUP BY tenant_id
)

SELECT
    dv.tenant_id,
    COALESCE(rpd.rut::text, 'SIN_RUT') AS rut,
    t.name AS nombre_empresa,
    dv.device_id,

    dv.status,

    CASE
        WHEN dv.status = 'active' THEN 'OPERATIVO'
        WHEN dv.status = 'suspended' THEN 'SUSPENDIDO'
        WHEN dv.status = 'disabled' THEN 'FUERA_DE_SERVICIO'
        ELSE 'DESCONOCIDO'
    END AS estado_device_negocio,

    TO_CHAR(dv.created_at, 'YYYY-MM-DD') AS fecha_creacion,

    FLOOR(EXTRACT(EPOCH FROM (NOW() - dv.created_at)) / 86400) AS dias_desde_creacion,

    CASE
        WHEN NOW() - dv.created_at <= INTERVAL '3 months' THEN 'OK'
        ELSE 'EXPIRADA'
    END AS garantia,

    TO_CHAR(ac.primera_emision, 'YYYY-MM-DD') AS primera_emision,
    TO_CHAR(ac.ultima_emision, 'YYYY-MM-DD') AS ultima_emision,

    FLOOR(EXTRACT(EPOCH FROM (NOW() - ac.ultima_emision)) / 86400) AS dias_sin_emision,

    CASE
        WHEN ac.ultima_emision IS NULL THEN 'SIN_EMISION'
        WHEN FLOOR(EXTRACT(EPOCH FROM (NOW() - ac.ultima_emision)) / 86400) = 0 THEN 'NORMAL'
        WHEN FLOOR(EXTRACT(EPOCH FROM (NOW() - ac.ultima_emision)) / 86400) < 3 THEN 'OBSERVACION'
        WHEN FLOOR(EXTRACT(EPOCH FROM (NOW() - ac.ultima_emision)) / 86400) < 6 THEN 'ATENCION'
        WHEN FLOOR(EXTRACT(EPOCH FROM (NOW() - ac.ultima_emision)) / 86400) < 15 THEN 'ALERTA'
        WHEN FLOOR(EXTRACT(EPOCH FROM (NOW() - ac.ultima_emision)) / 86400) < 30 THEN 'CRITICO'
        ELSE 'PELIGRO'
    END AS estado_operacional,

    TO_CHAR(rm.periodo_emision, 'YYYY-MM-DD') AS periodo_emision,

    COALESCE(rm.documentos_mes, 0) AS boletas_emitidas,

    CASE 
        WHEN rm.documentos_mes IS NULL THEN NULL
        WHEN dv.status = 'active'
             AND ac.ultima_emision IS NOT NULL
             AND NOW() - ac.ultima_emision > INTERVAL '7 days'
        THEN NULL
        ELSE ec.promedio_mensual_cajero
    END AS promedio_mensual,

    CASE 
        WHEN rm.documentos_mes IS NULL THEN NULL
        WHEN dv.status = 'active'
             AND ac.ultima_emision IS NOT NULL
             AND NOW() - ac.ultima_emision > INTERVAL '7 days'
        THEN NULL
        ELSE ec.total_periodos_cajero / 4.0
    END AS promedio_periodos,

    tc.total_cajeros,

    AVG(
        CASE 
            WHEN rm.documentos_mes IS NULL THEN NULL
            WHEN dv.status = 'active'
                 AND ac.ultima_emision IS NOT NULL
                 AND NOW() - ac.ultima_emision > INTERVAL '7 days'
            THEN NULL
            ELSE ec.total_periodos_cajero / 4.0
        END
    ) OVER (PARTITION BY dv.tenant_id) AS promedio_global,

    DENSE_RANK() OVER (
        PARTITION BY dv.tenant_id
        ORDER BY COALESCE(rm.documentos_mes,0) DESC
    ) AS ranking_global,

    rm.ranking_mensual,

    CASE
        WHEN dv.status = 'active' AND ac.ultima_emision IS NULL THEN 'ACTIVO_SIN_EMISION'
        WHEN dv.status = 'active' AND ac.ultima_emision IS NOT NULL
             AND NOW() - ac.ultima_emision > INTERVAL '7 days' THEN 'ACTIVO_INACTIVO'
        WHEN dv.status IN ('disabled','suspended') AND ac.ultima_emision IS NOT NULL THEN 'EMITIENDO_NO_ACTIVO'
        ELSE 'OK'
    END AS alerta_consistencia

FROM devices dv

LEFT JOIN ranking_mensual rm ON rm.device_id = dv.device_id
LEFT JOIN rut_por_device rpd ON rpd.device_id = dv.device_id
LEFT JOIN estadisticas_cajero ec ON ec.device_id = dv.device_id
LEFT JOIN actividad_cajero ac ON ac.device_id = dv.device_id
LEFT JOIN rr_gestion_soporte.gsoporte_tenant t ON t.tenant_id = dv.tenant_id
LEFT JOIN total_cajeros tc ON tc.tenant_id = dv.tenant_id;


-- =========================================
-- INDICES
-- =========================================

CREATE INDEX idx_mv_cajeros_tenant
ON rr_gestion_soporte.mv_monitoreo_cajeros (tenant_id);

CREATE INDEX idx_mv_cajeros_device
ON rr_gestion_soporte.mv_monitoreo_cajeros (device_id);

CREATE INDEX idx_mv_cajeros_periodo
ON rr_gestion_soporte.mv_monitoreo_cajeros (periodo_emision);

CREATE INDEX idx_mv_cajeros_ranking
ON rr_gestion_soporte.mv_monitoreo_cajeros (ranking_global);


-- =========================================
-- UNIQUE INDEX (para refresh concurrente)
-- =========================================

CREATE UNIQUE INDEX ux_mv_cajeros
ON rr_gestion_soporte.mv_monitoreo_cajeros (tenant_id, device_id, periodo_emision);


-- =========================================
-- REFRESH
-- =========================================

-- REFRESH MATERIALIZED VIEW rr_gestion_soporte.mv_monitoreo_cajeros;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY rr_gestion_soporte.mv_monitoreo_cajeros;

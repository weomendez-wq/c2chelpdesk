WITH devices AS (
    SELECT
        d.device_id,
        d.tenant_id
    FROM rr_gestion_soporte.gsoporte_device d
    WHERE d.tenant_id = '767b1169-d1f5-4ecc-ba8a-21700c5a3e2c'
),

-- 📅 GENERADOR DE MESES (CLAVE)
periodos AS (
    SELECT generate_series(
        date_trunc('month', NOW() - INTERVAL '4 months'),
        date_trunc('month', NOW()),
        interval '1 month'
    ) AS periodo_emision
),

docs_parseados AS (
    SELECT
        doc.device_id,
        doc.tenant_id,
        rr_gestion_soporte.gsoporte_safe_parse_timestamp(doc.fechaemision::text) AS fecha_emision
    FROM documentos doc
    WHERE doc.tenant_id = '767b1169-d1f5-4ecc-ba8a-21700c5a3e2c'
),

docs_validos AS (
    SELECT *
    FROM docs_parseados
    WHERE fecha_emision IS NOT NULL
),

docs_intervalo AS (
    SELECT *
    FROM docs_validos
    WHERE fecha_emision >= NOW() - INTERVAL '4 months'
),

-- ✅ AGREGACIÓN CORRECTA (SIN RUT)
docs_mes AS (
    SELECT
        device_id,
        tenant_id,
        date_trunc('month', fecha_emision) AS periodo_emision,
        COUNT(*) AS documentos_mes
    FROM docs_intervalo
    GROUP BY device_id, tenant_id, date_trunc('month', fecha_emision)
),

-- 🧱 BASE COMPLETA: TODOS LOS CAJEROS x TODOS LOS MESES
base_completa AS (
    SELECT
        d.device_id,
        d.tenant_id,
        p.periodo_emision
    FROM devices d
    CROSS JOIN periodos p
),

-- 🔗 LEFT JOIN PARA TRAER EMISIONES (INCLUYE 0)
docs_mes_completo AS (
    SELECT
        b.device_id,
        b.tenant_id,
        b.periodo_emision,
        COALESCE(dm.documentos_mes, 0) AS documentos_mes
    FROM base_completa b
    LEFT JOIN docs_mes dm
        ON dm.device_id = b.device_id
        AND dm.periodo_emision = b.periodo_emision
),

actividad_cajero AS (
    SELECT
        device_id,
        tenant_id,
        MAX(fecha_emision) AS ultima_emision
    FROM docs_validos
    GROUP BY device_id, tenant_id
),

-- ✅ ESTADÍSTICAS CONSISTENTES
estadisticas_cajero AS (
    SELECT
        device_id,
        tenant_id,
        AVG(documentos_mes) AS promedio_mensual_cajero,
        SUM(documentos_mes) AS total_periodos_cajero
    FROM docs_mes_completo
    GROUP BY device_id, tenant_id
),

total_cajeros AS (
    SELECT
        tenant_id,
        COUNT(device_id) AS total_cajeros
    FROM rr_gestion_soporte.gsoporte_device
    WHERE tenant_id = '767b1169-d1f5-4ecc-ba8a-21700c5a3e2c'
    GROUP BY tenant_id
)

SELECT

    t.name AS "Nombre Empresa",
    dv.device_id AS "Nombre Caja",

    CASE
        WHEN ac.ultima_emision IS NULL THEN 'NO_OPERATIVO'
        WHEN NOW() - ac.ultima_emision <= INTERVAL '3 days' THEN 'NORMAL'
        WHEN NOW() - ac.ultima_emision <= INTERVAL '7 days' THEN 'OBSERVACION'
        WHEN NOW() - ac.ultima_emision <= INTERVAL '15 days' THEN 'WARNING'
        WHEN NOW() - ac.ultima_emision <= INTERVAL '30 days' THEN 'ALERTA'
        ELSE 'CRITICO'
    END AS "Estado Operacional Cajero",

    TO_CHAR(dmc.periodo_emision,'YYYY-MM') AS "Periodo de Emision",

    TO_CHAR(dmc.documentos_mes,'FM999,999,999,999')
        AS "Boletas Emitidas por Cajero y Periodo",

    TO_CHAR(ec.promedio_mensual_cajero,'FM999,999,999,999')
        AS "Promedio Mensual por Cajero",

    TO_CHAR(ec.total_periodos_cajero/4.0,'FM999,999,999,999')
        AS "Promedio Periodos por Cajero",

    tc.total_cajeros AS "Total Cajeros Registrados",

    TO_CHAR(
        AVG(ec.total_periodos_cajero/4.0) OVER(),
        'FM999,999,999,999'
    ) AS "Promedio Global",

    -- ✅ RANKING GLOBAL (TOTAL REAL)
    DENSE_RANK() OVER(
        ORDER BY ec.total_periodos_cajero DESC
    ) AS "Ranking Global Cajeros",

    -- ✅ RANKING MENSUAL LIMPIO
    DENSE_RANK() OVER(
        PARTITION BY dmc.periodo_emision
        ORDER BY dmc.documentos_mes DESC
    ) AS "Ranking Cajeros por Periodo"

FROM docs_mes_completo dmc

JOIN devices dv
    ON dv.device_id = dmc.device_id

LEFT JOIN estadisticas_cajero ec
    ON ec.device_id = dv.device_id

LEFT JOIN actividad_cajero ac
    ON ac.device_id = dv.device_id

LEFT JOIN rr_gestion_soporte.gsoporte_tenant t
    ON t.tenant_id = dv.tenant_id

LEFT JOIN total_cajeros tc
    ON tc.tenant_id = dv.tenant_id

ORDER BY
    dmc.periodo_emision,
    "Ranking Cajeros por Periodo";
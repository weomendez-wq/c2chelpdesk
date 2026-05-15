WITH devices AS (
    SELECT
        d.device_id,
        d.tenant_id,
        d.created_at
    FROM rr_gestion_soporte.gsoporte_device d
    WHERE d.tenant_id = '767b1169-d1f5-4ecc-ba8a-21700c5a3e2c'
),

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

docs_mes AS (
    SELECT
        device_id,
        tenant_id,
        date_trunc('month', fecha_emision) AS periodo_emision,
        COUNT(*) AS documentos_mes
    FROM docs_intervalo
    GROUP BY device_id, tenant_id, date_trunc('month', fecha_emision)
),

base_completa AS (
    SELECT
        d.device_id,
        d.tenant_id,
        d.created_at,
        p.periodo_emision
    FROM devices d
    CROSS JOIN periodos p
),

docs_mes_completo AS (
    SELECT
        b.device_id,
        b.tenant_id,
        b.created_at,
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
),

ranking_mensual AS (
    SELECT
        dmc.*,
        DENSE_RANK() OVER (
            PARTITION BY dmc.periodo_emision
            ORDER BY dmc.documentos_mes DESC
        ) AS ranking_mensual
    FROM docs_mes_completo dmc
)

SELECT

    t.name AS "Nombre Empresa",
    dv.device_id AS "Nombre Caja",

    -- 📅 FECHA CREACIÓN EN ESPAÑOL
    INITCAP(TO_CHAR(dv.created_at, 'TMMonth DD "de" YYYY')) AS "Fecha Creacion",

    -- 📅 PRIMERA Y ÚLTIMA EMISIÓN
    TO_CHAR(ac.primera_emision, 'YYYY-MM-DD HH24:MI:SS') AS "Primera Emision",
    TO_CHAR(ac.ultima_emision, 'YYYY-MM-DD HH24:MI:SS') AS "Ultima Emision",

    -- ⏳ ANTIGÜEDAD
    FLOOR(EXTRACT(EPOCH FROM (NOW() - dv.created_at)) / 86400)
        AS "Dias Desde Creacion",

    -- ⏱️ DÍAS SIN EMISIÓN
    CASE
        WHEN ac.ultima_emision IS NULL THEN NULL
        ELSE FLOOR(EXTRACT(EPOCH FROM (NOW() - ac.ultima_emision)) / 86400)
    END AS "Dias Sin Emision",

    -- 🧠 ESTADO OPERACIONAL
    CASE
        WHEN NOW() - dv.created_at <= INTERVAL '3 months' THEN 'NUEVO'
        WHEN ac.ultima_emision IS NULL THEN 'SIN_EMISION'
        WHEN FLOOR(EXTRACT(EPOCH FROM (NOW() - ac.ultima_emision)) / 86400) = 0 THEN 'NORMAL'
        WHEN FLOOR(EXTRACT(EPOCH FROM (NOW() - ac.ultima_emision)) / 86400) < 3 THEN 'OBSERVACION'
        WHEN FLOOR(EXTRACT(EPOCH FROM (NOW() - ac.ultima_emision)) / 86400) < 6 THEN 'WARNING'
        WHEN FLOOR(EXTRACT(EPOCH FROM (NOW() - ac.ultima_emision)) / 86400) < 15 THEN 'ALERTA'
        WHEN FLOOR(EXTRACT(EPOCH FROM (NOW() - ac.ultima_emision)) / 86400) < 30 THEN 'CRITICO'
        ELSE 'PELIGRO'
    END AS "Estado Operacional Cajero",

    -- 🛡️ GARANTÍA
    CASE
        WHEN NOW() - dv.created_at <= INTERVAL '3 months'
            THEN 'GARANTIA_OK'
        ELSE 'GARANTIA_EXPIRADA'
    END AS "Estado Garantia",

    -- 📊 DATOS
    TO_CHAR(rm.periodo_emision,'YYYY-MM') AS "Periodo de Emision",

    TO_CHAR(rm.documentos_mes,'FM999,999,999,999')
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

    -- 🏆 RANKINGS
    DENSE_RANK() OVER (
        ORDER BY rm.documentos_mes DESC, rm.periodo_emision DESC
    ) AS "Ranking Global Cajeros",

    rm.ranking_mensual AS "Ranking Cajeros por Periodo"

FROM ranking_mensual rm

JOIN devices dv
    ON dv.device_id = rm.device_id

LEFT JOIN estadisticas_cajero ec
    ON ec.device_id = dv.device_id

LEFT JOIN actividad_cajero ac
    ON ac.device_id = dv.device_id

LEFT JOIN rr_gestion_soporte.gsoporte_tenant t
    ON t.tenant_id = dv.tenant_id

LEFT JOIN total_cajeros tc
    ON tc.tenant_id = dv.tenant_id

ORDER BY
    rm.periodo_emision,
    rm.ranking_mensual;

-- =========================================
-- CONSULTA MONITOREO CAJEROS (VERSIÓN FINAL CONSISTENTE)
-- =========================================

WITH devices AS (
    SELECT
        d.device_id,
        d.tenant_id,
        d.created_at,
        d.status
    FROM rr_gestion_soporte.gsoporte_device d
    WHERE d.tenant_id = '767b1169-d1f5-4ecc-ba8a-21700c5a3e2c'
),


docs_parseados AS (
    SELECT
        doc.device_id,
        doc.tenant_id,
        doc.rut,
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
        rut,
        date_trunc('month', fecha_emision) AS periodo_emision,
        COUNT(*) AS documentos_mes
    FROM docs_intervalo
    GROUP BY device_id, tenant_id, rut, date_trunc('month', fecha_emision)
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
        rut,
        AVG(documentos_mes) AS promedio_mensual_cajero,
        SUM(documentos_mes) AS total_periodos_cajero
    FROM docs_mes
    GROUP BY device_id, tenant_id, rut
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
    SELECT tenant_id, COUNT(*) AS total_cajeros
    FROM devices
    GROUP BY tenant_id
)

SELECT
    rm.tenant_id AS "Tenant ID",
    rm.rut AS "Rut Empresa",
    t.name AS "Nombre Empresa",
    rm.device_id AS "Nombre Caja",

    dv.status AS "Estado Device",

    CASE
        WHEN dv.status = 'active' THEN 'OPERATIVO'
        WHEN dv.status = 'suspended' THEN 'SUSPENDIDO'
        WHEN dv.status = 'disabled' THEN 'FUERA_DE_SERVICIO'
        ELSE 'DESCONOCIDO'
    END AS "Estado Device Negocio",

    -- Fecha creación en español
    INITCAP(TO_CHAR(dv.created_at::timestamp, 'DD "de" Month "de" YYYY')) AS "Fecha Creacion",

    -- Edad del dispositivo
    FLOOR(EXTRACT(EPOCH FROM (NOW() - dv.created_at)) / 86400) AS "Dias Desde Creacion",

    -- Garantía
    CASE
        WHEN NOW() - dv.created_at <= INTERVAL '3 months' THEN 'OK'
        ELSE 'EXPIRADA'
    END AS "Garantia",

    -- Emisiones
    TO_CHAR(ac.primera_emision, 'YYYY-MM-DD') AS "Primera Emision",
    TO_CHAR(ac.ultima_emision, 'YYYY-MM-DD') AS "Ultima Emision",

    FLOOR(EXTRACT(EPOCH FROM (NOW() - ac.ultima_emision)) / 86400) AS "Dias Sin Emision",

    -- Estado operacional
    CASE
        WHEN ac.ultima_emision IS NULL THEN 'SIN_EMISION'
        WHEN FLOOR(EXTRACT(EPOCH FROM (NOW() - ac.ultima_emision)) / 86400) = 0 THEN 'NORMAL'
        WHEN FLOOR(EXTRACT(EPOCH FROM (NOW() - ac.ultima_emision)) / 86400) < 3 THEN 'OBSERVACION'
        WHEN FLOOR(EXTRACT(EPOCH FROM (NOW() - ac.ultima_emision)) / 86400) < 6 THEN 'WARNING'
        WHEN FLOOR(EXTRACT(EPOCH FROM (NOW() - ac.ultima_emision)) / 86400) < 15 THEN 'ALERTA'
        WHEN FLOOR(EXTRACT(EPOCH FROM (NOW() - ac.ultima_emision)) / 86400) < 30 THEN 'CRITICO'
        ELSE 'PELIGRO'
    END AS "Estado Operacional Cajero",

    TO_CHAR(rm.periodo_emision, 'YYYY-MM-DD') AS "Periodo de Emision",

    REPLACE(TO_CHAR(rm.documentos_mes, 'FM999G999G999G999'), ',', '.') AS "Boletas Emitidas",

    REPLACE(TO_CHAR(ec.promedio_mensual_cajero, 'FM999G999G999G999'), ',', '.') AS "Promedio Mensual",

    REPLACE(TO_CHAR(ec.total_periodos_cajero / 4.0, 'FM999G999G999G999'), ',', '.') AS "Promedio Periodos",

    tc.total_cajeros AS "Total Cajeros",

    REPLACE(TO_CHAR(AVG(ec.total_periodos_cajero / 4.0) OVER(), 'FM999G999G999G999'), ',', '.') AS "Promedio Global",

    -- Ranking GLOBAL basado en emisión mensual (NO consecutivo artificial)
    DENSE_RANK() OVER (
        ORDER BY rm.documentos_mes DESC
    ) AS "Ranking Global Cajeros",

    rm.ranking_mensual AS "Ranking Cajeros por Periodo"

FROM ranking_mensual rm

JOIN devices dv
    ON dv.device_id = rm.device_id

LEFT JOIN estadisticas_cajero ec
    ON ec.device_id = rm.device_id

LEFT JOIN actividad_cajero ac
    ON ac.device_id = rm.device_id

LEFT JOIN rr_gestion_soporte.gsoporte_tenant t
    ON t.tenant_id = rm.tenant_id

LEFT JOIN total_cajeros tc
    ON tc.tenant_id = rm.tenant_id

ORDER BY
    rm.periodo_emision,
    rm.ranking_mensual;

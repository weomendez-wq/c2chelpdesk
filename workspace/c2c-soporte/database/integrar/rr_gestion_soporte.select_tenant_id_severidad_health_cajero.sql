WITH emisiones_120d AS (
         SELECT documentos.tenant_id,
            documentos.device_id,
            documentos.fechaemision::date AS dia_emision
           FROM documentos
          WHERE documentos.fechaemision::date >= (CURRENT_DATE - '120 days'::interval)
          GROUP BY documentos.tenant_id, documentos.device_id, (documentos.fechaemision::date)
        ), ordenadas AS (
         SELECT emisiones_120d.tenant_id,
            emisiones_120d.device_id,
            emisiones_120d.dia_emision,
            lag(emisiones_120d.dia_emision) OVER (PARTITION BY emisiones_120d.tenant_id, emisiones_120d.device_id ORDER BY emisiones_120d.dia_emision) AS dia_anterior
           FROM emisiones_120d
        ), brechas AS (
         SELECT ordenadas.tenant_id,
            ordenadas.device_id,
            max(ordenadas.dia_emision) AS ultima_emision_120d,
            COALESCE(max(ordenadas.dia_emision - ordenadas.dia_anterior), 0) AS max_gap_dias_120d
           FROM ordenadas
          GROUP BY ordenadas.tenant_id, ordenadas.device_id
        )
 SELECT tenant_id,
    device_id,
    ultima_emision_120d,
    max_gap_dias_120d,
    CURRENT_DATE - ultima_emision_120d AS dias_desde_ultima_emision,
        CASE
            WHEN (CURRENT_DATE - ultima_emision_120d) <= 100 THEN 'ACTIVO'::text
            ELSE 'INACTIVO'::text
        END AS estado_dispositivo,
        CASE
            WHEN max_gap_dias_120d <= 5 THEN 'NORMAL'::text
            WHEN max_gap_dias_120d <= 30 THEN 'OBSERVACION'::text
            WHEN max_gap_dias_120d <= 45 THEN 'ALARMA'::text
            ELSE 'CRITICO'::text
        END AS estado_operativo_dispositivo,
        CASE
            WHEN (CURRENT_DATE - ultima_emision_120d) > 100 THEN 'NOAPLICA - DISPOSITIVO INACTIVO'::text
            WHEN max_gap_dias_120d > 45 THEN 'CRITICO - INTERMITENCIA SEVERA'::text
            WHEN max_gap_dias_120d > 30 THEN 'ALARMA - INTERMITENCIA ALTA'::text
            WHEN max_gap_dias_120d > 5 THEN 'OBSERVACION - INTERMITENCIA MODERADA'::text
            ELSE 'NORMAL - OPERACION CONTINUA'::text
        END AS severidad_dispositivo
   FROM brechas b
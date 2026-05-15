SELECT
    d.tenant_id,
    d.device_id,
    d.tipodocumento,    
    COUNT(rr_gestion_soporte.gsoporte_safe_parse_timestamp(d.fechaemision)::date)
FROM documentos d
WHERE rr_gestion_soporte.gsoporte_safe_parse_timestamp(d.fechaemision)
      >= CURRENT_DATE - INTERVAL '3 months'
	  and d.tenant_id='767b1169-d1f5-4ecc-ba8a-21700c5a3e2c'
GROUP BY
    d.tenant_id,
    d.device_id,
    d.tipodocumento,
    rr_gestion_soporte.gsoporte_safe_parse_timestamp(d.fechaemision)::date

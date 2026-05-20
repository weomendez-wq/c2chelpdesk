SELECT
    'helpdesk_email_message' AS object_name,
    to_regclass('rr_gestion_soporte.helpdesk_email_message') IS NOT NULL AS exists_ok;

SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'rr_gestion_soporte'
  AND table_name = 'helpdesk_email_message'
ORDER BY ordinal_position;

SELECT
    conname,
    contype
FROM pg_constraint
WHERE conrelid = 'rr_gestion_soporte.helpdesk_email_message'::regclass
ORDER BY conname;

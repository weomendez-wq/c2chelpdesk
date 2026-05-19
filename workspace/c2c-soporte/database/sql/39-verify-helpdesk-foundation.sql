SELECT
    table_schema,
    table_name
FROM information_schema.tables
WHERE table_schema = 'rr_gestion_soporte'
  AND table_name IN (
      'helpdesk_catalog',
      'helpdesk_assignee',
      'helpdesk_contact',
      'helpdesk_ticket',
      'helpdesk_ticket_event',
      'helpdesk_ticket_link',
      'helpdesk_ticket_time_entry',
      'helpdesk_tool',
      'helpdesk_ticket_tool'
  )
ORDER BY table_name;

SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'rr_gestion_soporte'
  AND table_name LIKE 'helpdesk_%'
ORDER BY table_name, ordinal_position;

SELECT
    conrelid::regclass AS table_name,
    conname AS constraint_name,
    contype AS constraint_type
FROM pg_constraint
WHERE connamespace = 'rr_gestion_soporte'::regnamespace
  AND conrelid::regclass::text LIKE 'rr_gestion_soporte.helpdesk_%'
ORDER BY conrelid::regclass::text, constraint_name;

SELECT
    schemaname,
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'rr_gestion_soporte'
  AND tablename LIKE 'helpdesk_%'
ORDER BY tablename, indexname;

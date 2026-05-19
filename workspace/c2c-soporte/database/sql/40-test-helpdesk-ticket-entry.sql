BEGIN;

WITH assignee AS (
    INSERT INTO rr_gestion_soporte.helpdesk_assignee
        (username, email, display_name, role_name)
    VALUES
        ('qa.helpdesk.local', 'qa.helpdesk.local@example.invalid', 'QA Helpdesk Local', 'Soporte')
    RETURNING assignee_id
),
contact AS (
    INSERT INTO rr_gestion_soporte.helpdesk_contact
        (
            display_name,
            alias,
            email,
            phone_1,
            position_name,
            tenant_id,
            rut,
            company_name_snapshot,
            status,
            notes
        )
    VALUES
        (
            'Contacto Prueba Local',
            'contacto-local',
            'contacto.local@example.invalid',
            '+56000000000',
            'Operaciones',
            '00000000-0000-0000-0000-000000000001'::uuid,
            '11111111-1',
            'Empresa Prueba Local',
            'ACTIVO',
            'Registro transaccional de prueba. Debe quedar rollback.'
        )
    RETURNING contact_id
),
ticket AS (
    INSERT INTO rr_gestion_soporte.helpdesk_ticket
        (
            title,
            description,
            status_code,
            priority_code,
            category_code,
            support_type_code,
            source,
            tenant_id,
            rut,
            company_name_snapshot,
            contact_id,
            device_id,
            document_type,
            cafserial,
            folio_ini,
            folio_fin,
            alert_source,
            alert_severity,
            alert_entity_id,
            reference_date,
            assigned_to,
            opened_by,
            is_after_hours
        )
    SELECT
        'Prueba local de ingreso helpdesk',
        'Ticket creado para validar constraints, links y timeline. La transaccion termina en rollback.',
        'OPEN',
        'MEDIUM',
        'OPERACIONAL',
        'CORRECTIVO',
        'MANUAL',
        '00000000-0000-0000-0000-000000000001'::uuid,
        '11111111-1',
        'Empresa Prueba Local',
        contact.contact_id,
        'DEVICE_TEST_LOCAL',
        39,
        'CAF_TEST_LOCAL',
        1000,
        1999,
        'TEST_LOCAL',
        'WARNING',
        'TEST-ENTITY-001',
        CURRENT_DATE,
        assignee.assignee_id,
        assignee.assignee_id,
        false
    FROM assignee, contact
    RETURNING ticket_id, ticket_number
),
event_created AS (
    INSERT INTO rr_gestion_soporte.helpdesk_ticket_event
        (ticket_id, event_type, to_status_code, comment, metadata, created_by)
    SELECT
        ticket.ticket_id,
        'CREATED',
        'OPEN',
        'Ticket creado por prueba transaccional local.',
        jsonb_build_object('test', true, 'rollback_expected', true),
        assignee.assignee_id
    FROM ticket, assignee
    RETURNING event_id
),
ticket_link AS (
    INSERT INTO rr_gestion_soporte.helpdesk_ticket_link
        (
            ticket_id,
            link_type,
            tenant_id,
            rut,
            device_id,
            document_type,
            cafserial,
            folio_ini,
            folio_fin,
            entity_id,
            source
        )
    SELECT
        ticket.ticket_id,
        'ALERT',
        '00000000-0000-0000-0000-000000000001'::uuid,
        '11111111-1',
        'DEVICE_TEST_LOCAL',
        39,
        'CAF_TEST_LOCAL',
        1000,
        1999,
        'TEST-ENTITY-001',
        'TEST_LOCAL'
    FROM ticket
    RETURNING link_id
),
time_entry AS (
    INSERT INTO rr_gestion_soporte.helpdesk_ticket_time_entry
        (ticket_id, work_date, started_at, finished_at, is_after_hours, notes, created_by)
    SELECT
        ticket.ticket_id,
        CURRENT_DATE,
        '09:00'::time,
        '09:30'::time,
        false,
        'Tiempo de prueba transaccional.',
        assignee.assignee_id
    FROM ticket, assignee
    RETURNING time_entry_id
),
tool AS (
    INSERT INTO rr_gestion_soporte.helpdesk_tool
        (tool_type, name, description)
    VALUES
        ('SOFTWARE', 'Herramienta Prueba Local', 'Herramienta creada solo dentro de rollback.')
    RETURNING tool_id
),
ticket_tool AS (
    INSERT INTO rr_gestion_soporte.helpdesk_ticket_tool
        (ticket_id, tool_id, notes)
    SELECT
        ticket.ticket_id,
        tool.tool_id,
        'Relacion ticket-herramienta de prueba.'
    FROM ticket, tool
    RETURNING ticket_tool_id
)
SELECT
    ticket.ticket_id,
    ticket.ticket_number,
    event_created.event_id,
    ticket_link.link_id,
    time_entry.time_entry_id,
    tool.tool_id,
    ticket_tool.ticket_tool_id
FROM ticket, event_created, ticket_link, time_entry, tool, ticket_tool;

ROLLBACK;

SELECT
    'rollback_ok' AS check_name,
    COUNT(*) AS persisted_test_tickets
FROM rr_gestion_soporte.helpdesk_ticket
WHERE title = 'Prueba local de ingreso helpdesk';

# Decision - Correo Helpdesk

## Contexto

Mesa de Ayuda debe recibir solicitudes externas que llegan por canales de comunicacion, partiendo por correo.

## Decision

Implementar la integracion por etapas:

1. Registrar trazabilidad local de correos en `rr_gestion_soporte.helpdesk_email_message`.
2. Crear un endpoint de ingesta simulada para validar normalizacion y creacion de ticket sin conectar una casilla real.
3. Conectar una casilla real en una etapa posterior usando IMAP, Microsoft Graph, Gmail API o webhook de proveedor.

## Criterio

El flujo de correo debe crear tickets usando el modelo Helpdesk existente:

- `rr_gestion_soporte.helpdesk_ticket`
- `rr_gestion_soporte.helpdesk_contact`
- `rr_gestion_soporte.helpdesk_ticket_event`

La trazabilidad del correo se guarda aparte para evitar duplicados y permitir auditoria por `message_id`.

## Seguridad

- No se toca `public`.
- No se guardan passwords ni tokens en codigo.
- No se conecta una casilla real hasta validar el flujo simulado.
- Se debe evitar crear tickets duplicados por el mismo `message_id`.

## Alternativas futuras

- IMAP: rapido para primera integracion controlada.
- Microsoft Graph: recomendado si la casilla esta en Microsoft 365.
- Gmail API: recomendado si la casilla esta en Google Workspace.
- Webhook de proveedor: recomendado para produccion robusta con proveedor de correo entrante.

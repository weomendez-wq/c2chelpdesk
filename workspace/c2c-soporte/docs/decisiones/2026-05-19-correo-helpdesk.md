# Decision - Correo Helpdesk

## Contexto

Mesa de Ayuda debe recibir solicitudes externas que llegan por canales de comunicacion, partiendo por correo.

## Decision

Implementar la integracion por etapas:

1. Registrar trazabilidad local de correos en `rr_gestion_soporte.helpdesk_email_message`.
2. Crear un endpoint de ingesta simulada para validar normalizacion y creacion de ticket sin conectar una casilla real.
3. Conectar una casilla real Gmail usando Gmail API y OAuth.

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

## Canal elegido

El canal real sera **Gmail**. La integracion recomendada es Gmail API con OAuth,
no password directo ni credenciales personales en codigo.

### Flujo objetivo Gmail

1. Consultar mensajes nuevos de la casilla de soporte.
2. Leer metadata segura: `id`, `threadId`, `Message-ID`, remitente, asunto,
   fecha, snippet y cuerpo normalizado.
3. Registrar el correo en `rr_gestion_soporte.helpdesk_email_message`.
4. Evitar duplicados por `message_id` y `hash_dedup`.
5. Crear ticket nuevo o asociar respuesta a ticket existente.
6. Dejar correos ambiguos en estado `NEEDS_REVIEW` para revision del agente.

### Configuracion esperada

- `GMAIL_ENABLED`: activa o desactiva el conector.
- `GMAIL_SUPPORT_MAILBOX`: casilla de soporte a monitorear.
- `GMAIL_POLL_INTERVAL_SECONDS`: frecuencia de revision.
- `GMAIL_LABEL_PROCESSED`: etiqueta para mensajes procesados.
- `GMAIL_LABEL_REVIEW`: etiqueta para mensajes que requieren revision.

Los secretos OAuth no deben versionarse. Deben quedar fuera del repositorio, en
variables de entorno locales o en un store seguro.

## Alternativas futuras secundarias

- IMAP: rapido para primera integracion controlada.
- Microsoft Graph: recomendado si la casilla esta en Microsoft 365.
- Webhook de proveedor: recomendado para produccion robusta con proveedor de correo entrante.

## Canales posteriores

- WhatsApp: integrar solo con WhatsApp Business API o proveedor con webhook.
- Telefono IP: integrar cuando exista PBX/proveedor SIP con API, logs o CDR.
- Mientras tanto, ambos canales pueden entrar como ticket manual con
  `channelCode = WHATSAPP` o `PHONE`.

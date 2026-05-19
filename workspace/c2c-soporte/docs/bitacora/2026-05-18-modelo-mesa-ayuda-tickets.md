# Bitacora - Modelo Mesa de Ayuda / Tickets

Fecha: 2026-05-18

## Objetivo

Documentar el modelo local de tickets antes de implementar SQL, backend o frontend editable.

## Contexto

El prototipo Helpdesk ya muestra una bandeja candidata usando alertas operativas. El siguiente paso es definir como esas alertas pueden convertirse en tickets reales de soporte.

## Decision

La Mesa de Ayuda sera un modulo operacional propio, no un mantenedor.

Los tickets se almacenaran en tablas locales `rr_gestion_soporte` y solo referenciaran datos operativos. No deben modificar `public`, `staging_public`, documentos, CAF, folios ni devices.

## Documentos actualizados

- `docs/26-modelo-mesa-ayuda-tickets.md`
- `docs/21-mapa-modulos-c2c-helpdesk.md`
- `README.md`
- `shared-docs/soporte-workspace.html`

## Entidades propuestas

- `rr_gestion_soporte.helpdesk_ticket`
- `rr_gestion_soporte.helpdesk_ticket_event`
- `rr_gestion_soporte.helpdesk_ticket_link`

## Proximo paso recomendado

Validar estados, prioridades y reglas de ticket antes de crear SQL.

Decision pendiente:

- Confirmar si los tickets manuales sin alerta se implementan desde la primera version.
- Confirmar si se requiere catalogo local de responsables.
- Confirmar si habra adjuntos en esta etapa o se deja para una fase posterior.

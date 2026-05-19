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

## Decision 1 - Tickets manuales

Resultado:

```txt
Permitidos desde la primera version
```

Motivo:

Soporte puede recibir casos por canales externos o por gestion preventiva, sin que exista una alerta automatica previa.

Reglas:

- Origen `MANUAL`.
- No modifica datos origen.
- Debe registrar evento `CREATED`.
- Debe tener contexto minimo por empresa, categoria o descripcion.

Documento:

```txt
docs/decisiones/2026-05-18-tickets-manuales.md
```

## Decision 2 - Catalogo de responsables

Resultado:

```txt
Incluido desde la primera version
```

Motivo:

Asignar tickets a texto libre dificultaria filtros, metricas y auditoria.

Reglas:

- Catalogo local `rr_gestion_soporte.helpdesk_assignee`.
- El ticket puede nacer sin responsable.
- Solo responsables activos aparecen para nuevas asignaciones.
- Cambiar responsable registra evento `ASSIGNED`.

Documento:

```txt
docs/decisiones/2026-05-18-catalogo-responsables-helpdesk.md
```

## Decision 3 - Adjuntos

Resultado:

```txt
Fuera de la primera version
```

Motivo:

Los adjuntos agregan decisiones de almacenamiento, seguridad, limites, auditoria y respaldo. Conviene validar primero el flujo principal de tickets.

Reglas:

- Sin upload en v1.
- Sin archivos persistidos en tickets v1.
- Comentarios y contexto estructurado cubren la primera version.
- Futura tabla candidata: `rr_gestion_soporte.helpdesk_ticket_attachment`.

Documento:

```txt
docs/decisiones/2026-05-18-adjuntos-helpdesk.md
```

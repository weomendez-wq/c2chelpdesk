# Modelo Mesa de Ayuda / Tickets

Fecha: 2026-05-18

## Objetivo

Definir el modelo local de tickets para integrar la mesa de ayuda del servicio de soporte dentro de C2C Helpdesk.

La mesa de ayuda debe permitir gestionar casos operativos sin modificar datos origen. Los tickets son una capa propia de gestion de soporte que se vincula con empresas, alertas, devices, CAF, rangos y documentos.

## Regla de seguridad

- No modificar `public`.
- No modificar `staging_public`.
- No alterar documentos, CAF, folios ni devices origen.
- Toda persistencia de tickets debe vivir en `rr_gestion_soporte`.
- Toda accion de usuario debe quedar auditada.
- Los tickets pueden referenciar datos origen, pero no deben corregirlos ni cambiarlos.

## Principio de producto

La alerta operacional detecta un problema o riesgo.

El ticket gestiona la atencion humana de ese problema.

```txt
Alerta -> candidato a ticket -> ticket -> timeline -> cierre
```

## Entidades principales

### `rr_gestion_soporte.helpdesk_ticket`

Tabla principal de tickets.

Campos propuestos:

- `ticket_id`
- `ticket_number`
- `title`
- `description`
- `status`
- `priority`
- `category`
- `source`
- `tenant_id`
- `rut`
- `empresa_name_snapshot`
- `device_id`
- `document_type`
- `cafserial`
- `folio_ini`
- `folio_fin`
- `alert_source`
- `alert_severity`
- `alert_entity_id`
- `reference_date`
- `assigned_to`
- `opened_by`
- `closed_by`
- `opened_at`
- `closed_at`
- `due_at`
- `created_at`
- `updated_at`

Notas:

- Los campos `empresa_name_snapshot`, `alert_severity` y similares son snapshot para conservar contexto historico aunque la cache cambie.
- `tenant_id` y `rut` permiten volver al contexto operativo de empresa.
- `device_id`, `document_type`, `cafserial`, `folio_ini` y `folio_fin` son opcionales porque no todos los tickets nacen de la misma fuente.

### `rr_gestion_soporte.helpdesk_ticket_event`

Timeline del ticket.

Campos propuestos:

- `event_id`
- `ticket_id`
- `event_type`
- `from_status`
- `to_status`
- `comment`
- `metadata`
- `created_by`
- `created_at`

Tipos de evento iniciales:

- `CREATED`
- `COMMENTED`
- `ASSIGNED`
- `STATUS_CHANGED`
- `PRIORITY_CHANGED`
- `LINKED_ALERT`
- `CLOSED`
- `REOPENED`

### `rr_gestion_soporte.helpdesk_ticket_link`

Relaciones flexibles entre ticket y entidades operativas.

Campos propuestos:

- `link_id`
- `ticket_id`
- `link_type`
- `tenant_id`
- `rut`
- `device_id`
- `document_type`
- `cafserial`
- `folio_ini`
- `folio_fin`
- `entity_id`
- `source`
- `created_at`

Tipos de link:

- `EMPRESA`
- `DEVICE`
- `ALERTA`
- `CAF`
- `RANGO_SII`
- `FOLIOS`
- `DOCUMENTO`
- `AGOTAMIENTO`

## Estados de ticket

Estados iniciales:

```txt
ABIERTO
EN_REVISION
EN_ESPERA_CLIENTE
EN_ESPERA_INTERNA
RESUELTO
CERRADO
CANCELADO
REABIERTO
```

Reglas:

- `ABIERTO`: creado, sin gestion activa.
- `EN_REVISION`: soporte esta investigando.
- `EN_ESPERA_CLIENTE`: depende de informacion externa del cliente.
- `EN_ESPERA_INTERNA`: depende de equipo interno.
- `RESUELTO`: solucion propuesta o aplicada.
- `CERRADO`: cierre definitivo.
- `CANCELADO`: no corresponde gestionar.
- `REABIERTO`: caso vuelve desde cerrado/resuelto.

## Prioridades

Prioridades iniciales:

```txt
BAJA
MEDIA
ALTA
URGENTE
CRITICA
```

Mapeo sugerido desde alertas:

- `SIN_FOLIOS`: `CRITICA`
- `URGENTE`: `URGENTE`
- `REVISION_DATOS`: `ALTA`
- `WARNING`: `MEDIA`
- `SIN_BASE_ESTIMACION`: `MEDIA`
- `SIN_EMISION`: `ALTA`

## Categorias

Categorias iniciales:

- `FOLIOS`
- `CAF_VENCIMIENTO`
- `AGOTAMIENTO`
- `DEVICE_SIN_EMISION`
- `EMPRESA_SIN_EMISION`
- `DATOS_NO_CUADRAN`
- `SII_RANGOS`
- `OTRO`

## Origen del ticket

Origenes permitidos:

- `MANUAL`
- `ALERTA_OPERATIVA`
- `EMPRESA`
- `DEVICE`
- `FOLIOS`
- `RANGO_SII`
- `PROCESO`

## Flujo inicial

### Crear ticket desde alerta

1. Usuario abre Mesa de Ayuda.
2. Revisa candidato.
3. Selecciona crear ticket.
4. Sistema copia contexto de la alerta.
5. Sistema crea `helpdesk_ticket`.
6. Sistema crea evento `CREATED`.
7. Sistema crea link `ALERTA`.

### Gestionar ticket

1. Usuario abre ticket.
2. Agrega comentario o cambia estado.
3. Sistema registra evento.
4. Si cambia responsable, registra `ASSIGNED`.
5. Si se resuelve, cambia a `RESUELTO`.
6. Si se cierra, cambia a `CERRADO`.

### Reabrir ticket

1. Usuario abre ticket cerrado.
2. Selecciona reabrir.
3. Sistema cambia estado a `REABIERTO`.
4. Sistema registra evento `REOPENED`.

## Reglas de auditoria

- Cada creacion o cambio debe registrar usuario solicitante.
- Cada cambio de estado debe guardar estado anterior y nuevo.
- Los comentarios no deben editarse destructivamente en primera version.
- Si se permite editar comentarios despues, debe quedar evento de auditoria.
- El ticket conserva snapshots aunque cambien alertas o caches.

## Relacion con alertas operativas

La primera version puede crear tickets desde:

- `rr_gestion_soporte.alertas_operativas_cache`

No se debe asumir que la alerta persistira en cache. Por eso al crear ticket se debe copiar:

- `source`
- `severity`
- `title`
- `detail`
- `entity_id`
- `document_type`
- `metric_value`
- `metric_secondary`
- `reference_date`
- `tenant_id`
- `tenant_name`
- `rut`
- `empresa_name`

## Endpoints propuestos

Solo diseno inicial:

```txt
GET  /api/support/helpdesk/tickets
GET  /api/support/helpdesk/tickets/:ticketId
POST /api/support/helpdesk/tickets
PATCH /api/support/helpdesk/tickets/:ticketId/status
POST /api/support/helpdesk/tickets/:ticketId/events
POST /api/support/helpdesk/tickets/from-alert
```

## UI propuesta

### Bandeja

Columnas o filtros:

- prioridad
- estado
- categoria
- responsable
- empresa
- fecha apertura
- vencimiento

### Detalle

Bloques:

- resumen del caso
- contexto empresa
- alerta o entidad asociada
- timeline
- acciones

### Acciones iniciales

- crear desde alerta
- asignar responsable
- cambiar estado
- comentar
- cerrar
- reabrir

## Criterios para implementar

Antes de crear SQL:

- Confirmar estados iniciales.
- Confirmar prioridades.
- Confirmar si se requiere responsable interno desde un catalogo local.
- Confirmar si habra adjuntos en primera version.
- Confirmar si el ticket puede crearse manualmente sin alerta.

Antes de crear frontend editable:

- Tener endpoints con validacion Zod.
- Tener auditoria en timeline.
- Tener confirmaciones para cierre y reapertura.

## Decision recomendada

Implementar en tres pasos:

1. SQL local de tickets y timeline.
2. Backend CRUD minimo y creacion desde alerta.
3. Frontend para bandeja y detalle.

No mezclar la mesa de ayuda con mantenedores. La mesa de ayuda debe ser un modulo operacional propio.

# API estandar

## Objetivo

Definir criterios minimos de respuesta antes de implementar endpoints.

## Respuesta exitosa

```json
{
  "ok": true,
  "data": {},
  "meta": {
    "requestId": "string"
  }
}
```

## Respuesta con error

```json
{
  "ok": false,
  "error": {
    "code": "string",
    "message": "string"
  },
  "meta": {
    "requestId": "string"
  }
}
```

## Reglas

- Toda respuesta debe incluir `requestId`.
- No exponer stack traces al frontend.
- Los errores deben tener `code` estable.
- Las validaciones deben devolver mensajes claros sin filtrar datos sensibles.

## Endpoint SQL explain

```txt
POST /api/admin/sql/explain
```

Request:

```json
{
  "sql": "SELECT * FROM staging_public.documentos LIMIT 10"
}
```

Response:

```json
{
  "ok": true,
  "data": {
    "plan": [],
    "summary": {
      "hasSeqScan": true,
      "seqScanNodes": ["Seq Scan on documentos"]
    }
  },
  "meta": {
    "requestId": "string"
  }
}
```

Errores esperados:

- `VALIDATION_ERROR`
- `SQL_NOT_READ_ONLY`
- `SQL_FORBIDDEN_COMMAND`
- `SQL_EXPLAIN_FAILED`

## Endpoints soporte

```txt
GET /api/support/companies
GET /api/support/devices
GET /api/support/company-devices
GET /api/support/control/companies
GET /api/support/control/documents-summary
GET /api/support/control/devices
GET /api/support/control/folios
GET /api/support/control/folio-ranges
GET /api/support/control/alerts
GET /api/support/control/cache-status
POST /api/support/control/cache-refresh
GET /api/support/helpdesk/tickets
POST /api/support/helpdesk/tickets/manual
POST /api/support/helpdesk/email-intake/simulated
GET /api/support/control/maintainers/dte-config
PATCH /api/support/control/maintainers/dte-config/:configId
GET /api/support/control/maintainers/folios-alert-config
PATCH /api/support/control/maintainers/folios-alert-config/:configId
```

Query params comunes:

- `limit`: entero entre 1 y 200. Default 50.
- `offset`: entero desde 0. Default 0.
- `search`: texto opcional para busqueda simple.

Filtros adicionales:

- `GET /api/support/devices?tenantId=<uuid>&status=active`
- `GET /api/support/company-devices?tenantId=<uuid>&rut=<rut>`
- `GET /api/support/control/devices?tenantId=<uuid>&rut=<rut>&alert=URGENTE&consistency=ACTIVO_SIN_EMISION`

Respuesta:

```json
{
  "ok": true,
  "data": {
    "items": [],
    "pagination": {
      "limit": 50,
      "offset": 0
    }
  },
  "meta": {
    "requestId": "string"
  }
}
```

`GET /api/support/control/devices` lee `rr_gestion_soporte.device_control_resumen` y permite revisar estado, garantia, documentos emitidos, dias sin emitir y alertas por device.

`GET /api/support/control/folio-ranges` lee `rr_gestion_soporte.folios_rangos_clasificados_detalle` y permite revisar rangos CAF clasificados para fase SII. Es solo lectura y no ejecuta acciones SII.

`GET /api/support/control/alerts` consolida alertas de empresas, devices, folios y proyeccion de agotamiento desde vistas locales `rr_gestion_soporte`. No consulta `public` ni ejecuta acciones de escritura.

`GET /api/support/control/cache-status` devuelve conteos actuales de caches locales y el ultimo refresh registrado.

`GET /api/support/helpdesk/tickets` devuelve la bandeja reciente de tickets desde `rr_gestion_soporte.helpdesk_ticket`, con datos de contacto cuando existan. Filtros iniciales:

- `status`: estado del ticket, por ejemplo `OPEN`.
- `priority`: prioridad, por ejemplo `MEDIUM`, `HIGH` o `URGENT`.
- `tenantId`: tenant seleccionado.
- `rut`: RUT de empresa.
- `search`: busqueda por asunto, detalle, empresa, contacto o correo.

`POST /api/support/helpdesk/tickets/manual` registra un ticket manual externo. Caso inicial: correo recibido por soporte. Escribe solo en `rr_gestion_soporte.helpdesk_ticket`, `rr_gestion_soporte.helpdesk_contact` cuando hay contacto, y `rr_gestion_soporte.helpdesk_ticket_event` con evento `CREATED`.

Request minimo:

```json
{
  "title": "Cliente informa error al emitir boletas",
  "channelCode": "EMAIL",
  "communicationTypeCode": "EXTERNAL",
  "priorityCode": "MEDIUM",
  "requestedBy": "soporte-local"
}
```

Campos opcionales relevantes:

- `description`
- `categoryCode`
- `supportTypeCode`
- `contactName`
- `contactEmail`
- `contactPhone`
- `tenantId`
- `rut`
- `companyName`
- `dueAt`

Este endpoint no consulta ni modifica `public`.

`POST /api/support/helpdesk/email-intake/simulated` simula la recepcion de un correo de soporte y crea ticket, contacto, evento y trazabilidad local. Requiere confirmacion explicita:

```json
{
  "confirm": "SIMULATE_EMAIL_INTAKE",
  "messageId": "correo-prueba-001",
  "fromEmail": "cliente@example.invalid",
  "fromName": "Cliente Prueba",
  "subject": "Cliente informa error al emitir boletas",
  "bodyText": "Favor revisar emision. RUT 11111111-1",
  "priorityCode": "HIGH",
  "requestedBy": "soporte-local"
}
```

Respuesta:

```json
{
  "duplicate": false,
  "emailMessageId": 1,
  "ticket": {}
}
```

Si el `messageId` o hash de deduplicacion ya existe, no crea otro ticket y devuelve `duplicate: true` cuando el correo ya tiene ticket asociado.

Este endpoint escribe solo en `rr_gestion_soporte.helpdesk_*` y no conecta una casilla real.

`POST /api/support/control/cache-refresh` ejecuta un refresco manual de caches locales en `rr_gestion_soporte`. Requiere confirmacion explicita:

```json
{
  "confirm": "REFRESH_LOCAL_CACHES",
  "requestedBy": "frontend-local"
}
```

Este proceso no toca `public`; reemplaza solo caches locales del proyecto y registra auditoria en `rr_gestion_soporte.cache_refresh_log`.

`GET /api/support/control/maintainers/dte-config` devuelve la configuracion local de tipos DTE y vencimiento CAF desde `rr_gestion_soporte.caf_vencimiento_config`. Es solo lectura en esta etapa y sirve como primera base del modulo Mantenedores.

`PATCH /api/support/control/maintainers/dte-config/:configId` actualiza solo la configuracion local DTE/CAF en `rr_gestion_soporte.caf_vencimiento_config` y registra auditoria en `rr_gestion_soporte.config_change_log`. Requiere confirmacion explicita:

```json
{
  "confirm": "UPDATE_DTE_CONFIG",
  "requestedBy": "frontend-local",
  "documentLabel": "Factura electronica",
  "vigenciaMeses": 6,
  "warningDias": 30,
  "aplicaVencimiento": true,
  "activo": true
}
```

Este endpoint no toca `public`, `staging_public`, documentos ni XML CAF. Despues de actualizar reglas se debe ejecutar el refresco manual de caches para recalcular alertas y rangos.

`GET /api/support/control/maintainers/folios-alert-config` devuelve reglas locales de umbrales desde `rr_gestion_soporte.folios_alerta_config`.

`PATCH /api/support/control/maintainers/folios-alert-config/:configId` actualiza solo umbrales locales de folios/emision y registra auditoria en `rr_gestion_soporte.config_change_log`. Requiere confirmacion explicita:

```json
{
  "confirm": "UPDATE_FOLIOS_ALERT_CONFIG",
  "requestedBy": "frontend-local",
  "minimoFoliosWarning": 30000,
  "minimoFoliosUrgente": 10000,
  "diasAgotamientoWarning": 30,
  "diasAgotamientoUrgente": 15,
  "diasSinEmisionWarning": 3,
  "diasSinEmisionUrgente": 7,
  "activo": true
}
```

Despues de actualizar umbrales se debe ejecutar el refresco manual de caches para recalcular alertas.

Filtros adicionales de rangos:

- `estadoOperativo`: `POR_OCUPAR`, `EN_USO`, `AGOTADO`, `CADUCADO_CANDIDATO`, `REVISION_DATOS`.
- `estadoRango`: `RANGOSINUSO`, `RANGOOCUPADO`, `RANGOCARGAPARCIAL`.
- `clasificacionTemporal`: `RANGOFUTURO`, `RANGOACTUAL`, `RANGOANTERIOR`, `SINCLASIFICACION`.
- `documentType`: tipo de documento.

Filtros adicionales de alertas:

- `severity`: `REVISION_DATOS`, `SIN_FOLIOS`, `URGENTE`, `WARNING`, `SIN_EMISION`, `SIN_BASE_ESTIMACION`.
- `source`: `EMPRESA`, `DEVICE`, `FOLIOS`, `AGOTAMIENTO`, `CAF_VENCIMIENTO`.
- `tenantId`: tenant seleccionado.
- `rut`: RUT de empresa.

`CAF_VENCIMIENTO` aplica inicialmente a facturas electronicas tipo `33`; usa fecha `FA` extraida desde `xml_caf` local. La vigencia y el umbral de aviso salen de `rr_gestion_soporte.caf_vencimiento_config` (`33`: 6 meses y warning 30 dias; `39` y `41`: `NO_APLICA` en esta etapa).

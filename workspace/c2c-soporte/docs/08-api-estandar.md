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

`POST /api/support/control/cache-refresh` ejecuta un refresco manual de caches locales en `rr_gestion_soporte`. Requiere confirmacion explicita:

```json
{
  "confirm": "REFRESH_LOCAL_CACHES",
  "requestedBy": "frontend-local"
}
```

Este proceso no toca `public`; reemplaza solo caches locales del proyecto y registra auditoria en `rr_gestion_soporte.cache_refresh_log`.

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

`CAF_VENCIMIENTO` aplica inicialmente a facturas electronicas tipo `33`; usa fecha `FA` extraida desde `xml_caf` local y vencimiento operacional a 6 meses.

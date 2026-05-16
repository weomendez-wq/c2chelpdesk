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

Filtros adicionales de rangos:

- `estadoOperativo`: `POR_OCUPAR`, `EN_USO`, `AGOTADO`, `CADUCADO_CANDIDATO`, `REVISION_DATOS`.
- `estadoRango`: `RANGOSINUSO`, `RANGOOCUPADO`, `RANGOCARGAPARCIAL`.
- `clasificacionTemporal`: `RANGOFUTURO`, `RANGOACTUAL`, `RANGOANTERIOR`, `SINCLASIFICACION`.
- `documentType`: tipo de documento.

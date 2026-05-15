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

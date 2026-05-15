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


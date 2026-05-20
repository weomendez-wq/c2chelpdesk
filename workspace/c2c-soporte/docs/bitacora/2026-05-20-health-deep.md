# Bitacora: health deep

**Fecha**: 2026-05-20

## Contexto

El orquestador valida `c2c-soporte` con `GET /api/health/deep`, pero el backend
solo exponia `GET /api/health`.

## Cambio

Se agrega `GET /api/health/deep` para verificar:

- Servicio backend activo.
- Conexion a PostgreSQL.
- Base conectada.
- Puerto de PostgreSQL observado por la conexion.

## Validacion

`GET http://localhost:5491/api/health/deep` responde OK e informa:

- base: `soporte`
- puerto: `5492`

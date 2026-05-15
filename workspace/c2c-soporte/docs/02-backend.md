# Backend

## Objetivo

Preparar un backend Node.js + Express mantenible, seguro y observable para C2C Soporte / DTE / Torre de Control.

## Responsabilidades iniciales

- Exponer APIs controladas para consulta operativa.
- Centralizar acceso a PostgreSQL en repositories o services.
- Validar entradas antes de ejecutar consultas.
- Bloquear operaciones SQL peligrosas en flujos administrativos.
- Registrar logs estructurados con `requestId`.

## Estructura objetivo

```txt
backend/
├── src/
│   ├── app/
│   ├── config/
│   ├── modules/
│   ├── shared/
│   ├── middlewares/
│   ├── services/
│   ├── repositories/
│   ├── routes/
│   ├── validators/
│   ├── utils/
│   └── jobs/
```

## Pendientes antes de implementar

- Agregar endpoint SQL seguro.
- Probar endpoint SQL contra PostgreSQL local.
- Agregar autenticacion/autorizacion para rutas administrativas.

## Decisiones tecnicas

- Lenguaje: TypeScript.
- Framework HTTP: Express.
- Validacion: Zod.
- Logger: Pino.
- PostgreSQL: `pg`, sin ORM en la primera etapa.
- Formato API: respuesta estandar documentada en `docs/08-api-estandar.md`.

## Scaffolding inicial

El backend inicial incluye:

- `src/server.ts`
- `src/app/createApp.ts`
- `src/config/env.ts`
- `src/config/database.ts`
- `src/middlewares/requestId.ts`
- `src/middlewares/notFoundHandler.ts`
- `src/middlewares/errorHandler.ts`
- `src/modules/health/health.routes.ts`
- `src/shared/apiResponse.ts`
- `src/shared/logger.ts`

## Modulo SQL inicial

El primer modulo administrativo sera `POST /api/admin/sql/explain`. Debe validar que la consulta sea de solo lectura, bloquear comandos peligrosos y ejecutar solo `EXPLAIN (FORMAT JSON)`.

## Tests iniciales

El backend usa `node:test` ejecutado con `tsx` para pruebas TypeScript. Los primeros casos cubren el validador SQL y la deteccion de `Seq Scan`.

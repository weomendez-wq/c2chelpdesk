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

- Crear scaffolding TypeScript.
- Crear configuracion de entorno validada con Zod.
- Crear logger Pino.
- Crear pool PostgreSQL con `pg`.
- Crear middleware de `requestId`.

## Decisiones tecnicas

- Lenguaje: TypeScript.
- Framework HTTP: Express.
- Validacion: Zod.
- Logger: Pino.
- PostgreSQL: `pg`, sin ORM en la primera etapa.
- Formato API: respuesta estandar documentada en `docs/08-api-estandar.md`.

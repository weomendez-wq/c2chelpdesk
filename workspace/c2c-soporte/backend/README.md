# Backend C2C Soporte

## Objetivo

Backend inicial para C2C Soporte / DTE / Torre de Control.

## Stack

- Node.js 20+
- Express
- TypeScript
- Zod
- Pino
- PostgreSQL con `pg`

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run typecheck
```

## Configuracion

Crear un `.env` local basado en `.env.example`.

```txt
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5434/soporte
LOG_LEVEL=debug
```

## Endpoint inicial

```txt
GET /api/health
```

Respuesta esperada:

```json
{
  "ok": true,
  "data": {
    "status": "ok",
    "service": "c2c-soporte-backend"
  },
  "meta": {
    "requestId": "string"
  }
}
```

## Endpoint SQL explain

```txt
POST /api/admin/sql/explain
```

Body:

```json
{
  "sql": "SELECT * FROM staging_public.documentos LIMIT 10"
}
```

Este endpoint ejecuta solo `EXPLAIN (FORMAT JSON)` y bloquea comandos de escritura o multiples sentencias.

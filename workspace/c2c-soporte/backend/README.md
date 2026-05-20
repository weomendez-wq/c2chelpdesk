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
PORT=5491
DATABASE_URL=postgres://postgres:postgres@localhost:5492/soporte
LOG_LEVEL=debug
```

## Gmail Helpdesk

La sincronizacion Gmail parte como comando manual controlado:

```powershell
npm run gmail:sync -- --max 10 --requested-by soporte-local
```

Con `GMAIL_ENABLED=false`, el comando responde `GMAIL_DISABLED` y no intenta
conectar con Google. Para activar la casilla real se requieren variables OAuth
fuera del repositorio.

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

## Endpoints soporte

```txt
GET /api/support/companies
GET /api/support/devices
GET /api/support/company-devices
GET /api/support/control/companies
GET /api/support/control/documents-summary
GET /api/support/control/devices
```

Estos endpoints leen vistas locales en `rr_gestion_soporte` y son el contrato inicial para el frontend.

`GET /api/support/control/companies` lee `rr_gestion_soporte.empresa_control_resumen` y entrega la primera vista certificada por empresa.

`GET /api/support/control/documents-summary` entrega resumen anual, mensual y por tipo de documento desde `rr_gestion_soporte.documentos_2026`, con filtros opcionales por `tenantId` y `rut`.

`GET /api/support/control/devices` lee `rr_gestion_soporte.device_control_resumen` y entrega control operativo por device con filtros por `tenantId`, `rut`, `status`, `alert` y `consistency`.

Los endpoints `GET /api/support/control/companies` y `GET /api/support/control/devices` entregan `pagination.total` para soportar paginacion real en frontend.

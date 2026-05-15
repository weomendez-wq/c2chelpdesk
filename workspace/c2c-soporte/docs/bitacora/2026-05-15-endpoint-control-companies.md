# Bitacora - Endpoint control companies

## Fecha

2026-05-15

## Objetivo

Exponer la vista certificada `rr_gestion_soporte.empresa_control_resumen` desde el backend.

## Endpoint

```txt
GET /api/support/control/companies
```

## Filtros

- `limit`
- `offset`
- `search`
- `status`
- `tenantId`
- `rut`
- `alert`: `OK`, `WARNING`, `URGENTE`, `SIN_EMISION`

## Criterio

Este endpoint no reemplaza todavia al frontend inicial. Se agrega como contrato separado para que la proxima pantalla consuma datos certificados por empresa antes de avanzar a device, CAF o folios.

## Validacion

Comandos ejecutados:

```txt
npm run typecheck
npm run build
GET /api/support/control/companies?limit=5&offset=0
GET /api/support/control/companies?limit=5&offset=0&alert=URGENTE
```

Resultado:

```txt
typecheck: OK
build: OK
endpoint general: 200 OK
endpoint filtrado por alerta: 200 OK
```

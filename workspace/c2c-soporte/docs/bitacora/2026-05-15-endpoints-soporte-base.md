# Bitacora - Endpoints soporte base

## Fecha

2026-05-15

## Objetivo

Exponer desde backend las vistas base para iniciar el frontend en orden funcional.

## Endpoints planificados

- `GET /api/support/companies`
- `GET /api/support/devices`
- `GET /api/support/company-devices`

## Fuente

- `rr_gestion_soporte.empresas_resumen`
- `rr_gestion_soporte.dispositivos_resumen`
- `rr_gestion_soporte.empresa_dispositivo_resumen`

## Criterio

Los endpoints son de lectura, con paginacion limitada y filtros simples. No exponen tablas productivas ni ejecutan SQL recibido desde frontend.

## Implementacion

Modulo agregado:

```txt
backend/src/modules/support/
```

Rutas:

- `GET /api/support/companies`
- `GET /api/support/devices`
- `GET /api/support/company-devices`

## Validacion

- `npm run typecheck`: OK.
- `npm test`: 9 pruebas OK.
- Prueba HTTP local en puerto `3100`: los tres endpoints respondieron `ok: true` con `limit=2`.

# Refresco controlado de caches

Fecha: 2026-05-16

## Objetivo

Agregar un proceso manual para regenerar caches locales cuando cambien los datos migrados o cuando soporte necesite actualizar la vista operativa.

## Causa

Los endpoints quedaron rapidos porque leen caches locales. Sin un proceso de refresco, esas caches pueden quedar desactualizadas despues de nuevas cargas locales.

## Criterio de seguridad

- No tocar `public`.
- No ejecutar acciones contra origen productivo.
- Recalcular desde vistas locales y tablas migradas locales.
- Usar confirmacion explicita desde backend.
- Registrar auditoria en `rr_gestion_soporte.cache_refresh_log`.

## Script base

```txt
database/sql/performance/46-create-cache-refresh-control.sql
```

## Endpoints planificados

```txt
GET  /api/support/control/cache-status
POST /api/support/control/cache-refresh
```

## Implementacion

Se agregaron endpoints backend:

```txt
GET  /api/support/control/cache-status
POST /api/support/control/cache-refresh
```

El refresh:

- requiere `confirm = REFRESH_LOCAL_CACHES`
- crea tablas temporales desde vistas locales
- reemplaza caches locales en una transaccion
- registra `SUCCESS` o `ERROR` en `rr_gestion_soporte.cache_refresh_log`

Se agrego el modulo visual `Procesos` en frontend con:

- estado ultimo refresh
- duracion
- conteos de alertas y rangos cache
- boton manual `Refrescar caches`

## Validacion

```txt
backend typecheck OK
frontend typecheck OK
frontend build OK
GET cache-status OK
POST cache-refresh OK
```

## Pendientes despues de implementar

- Validar duracion y conteos despues de cada refresco.
- Evaluar optimizacion del calculo de refresh, actualmente puede tardar varios minutos porque recalcula vistas pesadas antes de reemplazar caches.

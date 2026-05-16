# Optimizacion local de querys

Fecha: 2026-05-16

## Objetivo

Reducir esperas excesivas y riesgo de timeout en los modulos activos del aplicativo.

## Causa encontrada

Las vistas funcionales eran correctas, pero recalculaban agregaciones sobre `rr_gestion_soporte.documentos_2026`, que hoy agrupa 3.919.488 documentos migrados desde tablas mensuales.

Los endpoints mas afectados eran:

- `GET /api/support/control/alerts`
- `GET /api/support/control/folio-ranges`
- `GET /api/support/control/folios`
- `GET /api/support/control/documents-summary`

## Acciones realizadas

Se crearon scripts locales en:

```txt
database/sql/performance/
```

Scripts:

- `40-measure-current-objects.sql`
- `41-inspect-local-indexes.sql`
- `42-explain-local-heavy-views.sql`
- `43-explain-local-heavy-views-analyze-template.sql`
- `44-create-local-performance-indexes.sql`
- `45-create-local-read-caches.sql`

Se ejecutaron en la base local `soporte`:

- indices locales sobre `staging_public` y `rr_gestion_soporte`
- estadisticas `ANALYZE` locales
- caches locales de lectura en `rr_gestion_soporte`

No se ejecuto nada contra `public`.

## Caches creadas

```txt
rr_gestion_soporte.documentos_2026_mensual_cache        322 filas
rr_gestion_soporte.documentos_2026_device_mensual_cache 1068 filas
rr_gestion_soporte.empresa_control_resumen_cache        86 filas
rr_gestion_soporte.device_control_resumen_cache         402 filas
rr_gestion_soporte.folios_control_resumen_cache         87 filas
rr_gestion_soporte.folios_proyeccion_agotamiento_cache  87 filas
rr_gestion_soporte.folios_rangos_clasificados_cache     374 filas
rr_gestion_soporte.alertas_operativas_cache             304 filas
```

## Medicion antes de usar caches

Medicion aproximada desde backend local:

```txt
alerts             22,30 s
folio-ranges       56,66 s
folios             43,88 s
documents-summary  21,68 s
```

## Medicion despues de usar caches

Medicion aproximada desde backend local:

```txt
alerts             0,06 s
folio-ranges       0,06 s
folios             0,06 s
documents-summary  0,07 s
```

## Cambios backend

El backend pasa a leer caches locales en:

- `listCompanyControl`
- `listDeviceControl`
- `listFoliosControl`
- `listFolioRanges`
- `listAlerts`
- `getDocumentsSummary`

## Pendientes

- Crear proceso controlado de refresco de caches.
- Agregar una pantalla o modulo de procesos para ejecutar refresco manual.
- Definir si el refresco debe invalidar caches con tabla staging temporal antes de reemplazar.
- Agregar estado de ultima generacion de cache al front.

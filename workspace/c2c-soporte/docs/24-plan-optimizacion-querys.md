# Plan de optimizacion de querys C2C Helpdesk

Fecha: 2026-05-16

## Objetivo

Reducir timeouts y esperas excesivas del aplicativo sin tocar `public` y sin ejecutar acciones destructivas. La meta operativa es que las vistas principales del front respondan en tiempos compatibles con una mesa de soporte.

## Regla de seguridad

- No ejecutar escrituras, actualizaciones, eliminaciones, truncados, bloqueos, permisos, DDL ni mantenimiento sobre `dte.public`.
- Todas las optimizaciones deben vivir en la base local `soporte`, principalmente en `rr_gestion_soporte`.
- Cualquier tabla resumen, indice o materializacion debe crearse solo sobre objetos locales ya migrados.
- `REFRESH MATERIALIZED VIEW` no se debe usar contra origen ni contra `public`; si se usa, debe ser local, manual y documentado.

## Diagnostico actual

Los endpoints lentos no fallan por error de backend, sino por costo de recalculo:

- `GET /api/support/control/alerts`
  - Consolida empresas, devices, folios y agotamiento con `UNION ALL`.
  - Lee `folios_control_resumen` y `folios_proyeccion_agotamiento`.
  - Cada request recalcula agregaciones sobre documentos 2026.

- `GET /api/support/control/folio-ranges`
  - Lee `folios_rangos_clasificados_detalle`.
  - Cruza rangos CAF contra documentos por `tenant_id`, `rut`, `tipodocumento` y rango de folios.
  - Este join por rango es naturalmente caro si se ejecuta completo en cada consulta.

- `GET /api/support/control/documents-summary`
  - Calcula totales, mensual y tipos desde `documentos_2026`.
  - Ejecuta varias consultas sobre la misma base documental.

- `GET /api/support/control/folios`
  - Lee `folios_control_resumen`.
  - La vista arma llaves desde CAF, disponibles, historial y documentos.

Riesgo adicional:

- Algunos endpoints ejecutan `SELECT *` mas `count(*)` contra la misma vista pesada. Eso puede duplicar el costo de una pantalla.

## Principio de mejora

Separar el sistema en dos capas:

1. Capa de calculo pesado local:
   - Tablas resumen o materialized views en `rr_gestion_soporte`.
   - Se recalculan manualmente o bajo proceso controlado.

2. Capa de lectura UI:
   - Endpoints leen tablas compactas ya calculadas.
   - Filtros por tenant, rut, severidad, estado y busqueda deben usar indices.

## Fase 1 - Medicion segura

Crear scripts de medicion local, solo lectura:

```txt
database/sql/performance/40-measure-current-endpoints.sql
database/sql/performance/41-inspect-local-indexes.sql
database/sql/performance/42-explain-local-heavy-views.sql
```

Scripts creados:

```txt
database/sql/performance/40-measure-current-objects.sql
database/sql/performance/41-inspect-local-indexes.sql
database/sql/performance/42-explain-local-heavy-views.sql
database/sql/performance/43-explain-local-heavy-views-analyze-template.sql
```

Comando local sugerido:

```powershell
cd C:\RODPROJECTSCODEX\workspace\c2c-soporte
$env:Path += ";C:\Program Files\PostgreSQL\18\bin"
$env:PGPASSWORD = "postgres"
psql -h localhost -p 5434 -U postgres -d soporte -f .\database\sql\performance\40-measure-current-objects.sql
psql -h localhost -p 5434 -U postgres -d soporte -f .\database\sql\performance\41-inspect-local-indexes.sql
psql -h localhost -p 5434 -U postgres -d soporte -f .\database\sql\performance\42-explain-local-heavy-views.sql
```

Medir:

- Cantidad de filas por tabla staging/local.
- Indices existentes.
- Tiempo de `EXPLAIN (ANALYZE, BUFFERS)` solo en base local `soporte`.
- Tiempo separado para:
  - `empresa_control_resumen`
  - `device_control_resumen`
  - `folios_control_resumen`
  - `folios_proyeccion_agotamiento`
  - `folios_rangos_clasificados_detalle`
  - `documentos_2026_normalizados`

Resultado esperado:

- Ranking de consultas por costo.
- Identificar si el cuello esta en documentos, CAF, historial o `count(*)`.

## Fase 2 - Indices locales base

Crear indices solo sobre tablas locales `staging_public` y tablas propias `rr_gestion_soporte`.

Script creado:

```txt
database/sql/performance/44-create-local-performance-indexes.sql
```

Comando local sugerido:

```powershell
cd C:\RODPROJECTSCODEX\workspace\c2c-soporte
$env:Path += ";C:\Program Files\PostgreSQL\18\bin"
$env:PGPASSWORD = "postgres"
psql -h localhost -p 5434 -U postgres -d soporte -f .\database\sql\performance\44-create-local-performance-indexes.sql
```

Indices candidatos:

```sql
-- documentos mensuales y resumen por empresa
(tenant_id, rut, tipodocumento)
(tenant_id, rut, tipodocumento, periodo)
(tenant_id, device_id, rut, tipodocumento)
(tenant_id, rut, tipodocumento, folio)
(fechaemision)

-- CAF/rangos
(tenant_id, rut, document_type)
(tenant_id, rut, document_type, folio_ini, folio_fin)

-- folios disponibles
(tenant_id, rut, document_type)

-- historial asignacion
(tenant_id, rut, document_type)
(tenant_id, device_id, document_type)

-- busqueda UI
(tenant_id)
(rut)
```

Notas:

- Para busqueda textual `ILIKE '%texto%'`, un indice B-tree no ayuda mucho. Evaluar `pg_trgm` solo si se acepta extension local.
- Si no queremos extensiones, limitar busqueda inicial a RUT exacto, tenant exacto o prefijo normalizado.

## Fase 3 - Normalizar documentos a tabla fisica local

`documentos_2026_normalizados` hoy es una vista que parsea fecha en cada lectura.

Propuesta:

Crear tabla local:

```txt
rr_gestion_soporte.documentos_2026_normalizados_cache
```

Campos recomendados:

- `periodo`
- `folio`
- `tenant_id`
- `device_id`
- `rut`
- `tipodocumento`
- `fecha_emision`
- `valortotal`
- `estado`
- `estado_sii`
- campos minimos usados por UI/reportes

Beneficio:

- La fecha queda parseada una sola vez.
- Los indices sobre `fecha_emision`, `tenant_id`, `rut`, `device_id`, `tipodocumento`, `folio` se vuelven efectivos.
- Las vistas de control dejan de recorrer el `UNION ALL` documental completo en cada request.

## Fase 4 - Resumenes compactos para UI

Crear tablas resumen locales derivadas de la cache documental:

```txt
rr_gestion_soporte.documentos_2026_empresa_resumen
rr_gestion_soporte.documentos_2026_device_resumen
rr_gestion_soporte.documentos_2026_mensual_resumen
rr_gestion_soporte.documentos_2026_tipo_resumen
```

Estas tablas deben cubrir:

- total documentos
- primera y ultima emision
- dias sin emitir
- total por mes
- total por tipo DTE
- devices con emision
- primer/ultimo folio por empresa/device/tipo

Los endpoints `documents-summary`, `companies` y `devices` deben leer estos resumenes en vez de agrupar millones de filas.

Script inicial de caches creado:

```txt
database/sql/performance/45-create-local-read-caches.sql
```

Este script crea caches locales de lectura para:

- resumen mensual documental
- resumen mensual por device
- control empresas
- control devices
- control folios
- proyeccion de agotamiento
- rangos SII clasificados
- alertas operativas

## Fase 5 - Optimizar Folios/CAF

Crear resumen local:

```txt
rr_gestion_soporte.folios_control_resumen_cache
```

Origen:

- CAF resumen
- folios disponibles
- historial asignacion
- resumen documental por empresa/tipo

Campos clave:

- `tenant_id`
- `rut`
- `document_type`
- `caf_count`
- `folios_otorgados`
- `folios_disponibles`
- `folios_solicitados`
- `folios_entregados_por_rango`
- `diferencia_solicitado_rango`
- `documentos_emitidos_2026`
- `ultima_emision`
- `dias_sin_emitir`
- `nivel_alerta_folios`

Beneficio:

- `GET /api/support/control/folios` pasa a leer una tabla pequena.
- `GET /api/support/control/alerts` no recalcula folios.

## Fase 6 - Optimizar proyeccion de agotamiento

Crear resumen local:

```txt
rr_gestion_soporte.folios_proyeccion_agotamiento_cache
```

Debe usar:

- `folios_control_resumen_cache`
- consumo 30/90 dias ya resumido desde documentos
- historial anual ya agregado
- `folios_alerta_config`

Beneficio:

- Alertas por agotamiento pasan de calculo dinamico a lectura directa.
- Se mantiene la capacidad de cambiar umbrales y recalcular manualmente.

## Fase 7 - Optimizar Rangos SII

El cuello mayor probable es el join:

```txt
documento.folio BETWEEN caf.folio_ini AND caf.folio_fin
```

Propuesta:

Crear tabla local:

```txt
rr_gestion_soporte.folios_rangos_clasificados_cache
```

Campos:

- `tenant_id`
- `rut`
- `document_type`
- `cafserial`
- `folio_ini`
- `folio_fin`
- `total_rango`
- `total_ocupado`
- `primer_folio_emitido`
- `folio_mayor`
- `folio_mayor_global`
- `fecha_ultima_emision`
- `estado_rango`
- `clasificacion_temporal`
- `lost_folios`
- `estado_operativo_rango`

Indices:

```sql
(estado_operativo_rango, clasificacion_temporal)
(tenant_id, rut, document_type)
(tenant_id, rut, document_type, folio_ini, folio_fin)
(lost_folios)
```

Beneficio:

- El modulo Rangos SII deja de recalcular rangos en cada paginacion.
- Se puede listar rapido y dejar el detalle pesado para procesos manuales.

## Fase 8 - Tabla unica de alertas operativas

Crear:

```txt
rr_gestion_soporte.alertas_operativas_cache
```

Fuentes:

- empresa resumen cache
- device resumen cache
- folios control cache
- proyeccion agotamiento cache
- opcional: rangos clasificados cache agregada

Campos:

- `alert_id`
- `tenant_id`
- `tenant_name`
- `rut`
- `empresa_name`
- `source`
- `severity`
- `title`
- `detail`
- `entity_id`
- `document_type`
- `metric_value`
- `metric_secondary`
- `reference_date`
- `generated_at`

Indices:

```sql
(severity, source)
(tenant_id, rut)
(source)
(generated_at)
```

Beneficio:

- `GET /api/support/control/alerts` debe pasar de segundos a milisegundos.
- La bandeja de soporte queda estable y paginable.

## Fase 9 - Cambios backend

Cambios recomendados:

- Reemplazar vistas pesadas por caches locales en endpoints de uso frecuente.
- Evitar `SELECT *`; seleccionar solo columnas que necesita el front.
- Evitar `count(*)` pesado por defecto.
- Agregar parametro opcional:

```txt
includeTotal=true|false
```

Regla:

- Listados grandes usan `includeTotal=false` por defecto.
- El front muestra "mas resultados" sin bloquearse.
- Solo calcular total cuando el usuario lo necesita.

## Fase 10 - Cambios frontend

Cambios recomendados:

- Cargar primero cards/resumen, luego tablas.
- No disparar todos los modulos al iniciar la app.
- Cargar modulo bajo demanda al entrar en la seccion.
- Agregar debounce a busqueda.
- Mantener spinner, pero con texto de proceso y estado parcial.
- Para Rangos SII, cargar por defecto solo `CADUCADO_CANDIDATO` o `POR_OCUPAR`, no todos.

## Orden recomendado de implementacion

1. Medir consultas actuales con scripts locales.
2. Crear indices locales base.
3. Crear cache fisica de `documentos_2026_normalizados`.
4. Crear resumenes documentales compactos.
5. Migrar `documents-summary`, empresas y devices a resumenes.
6. Crear `folios_control_resumen_cache`.
7. Crear `folios_proyeccion_agotamiento_cache`.
8. Crear `alertas_operativas_cache` y cambiar endpoint Alertas.
9. Crear `folios_rangos_clasificados_cache` y cambiar Rangos SII.
10. Ajustar frontend para carga diferida y `includeTotal=false`.

## Criterio de exito

- Torre de Control: menos de 2 segundos.
- Empresas/devices: menos de 2 segundos.
- Documentos summary: menos de 3 segundos.
- Folios/CAF: menos de 3 segundos.
- Alertas: menos de 2 segundos.
- Rangos SII listado: menos de 5 segundos.

## Avance 2026-05-16

Se implemento una primera optimizacion local:

- indices locales en tablas migradas `staging_public`
- caches locales de lectura en `rr_gestion_soporte`
- backend leyendo caches para documentos, folios, rangos y alertas

Resultado medido:

```txt
alerts             22,30 s -> 0,06 s
folio-ranges       56,66 s -> 0,06 s
folios             43,88 s -> 0,06 s
documents-summary  21,68 s -> 0,07 s
```

Bitacora:

```txt
docs/bitacora/2026-05-16-optimizacion-querys-local.md
```

## Siguiente avance: refresco controlado

Script de control creado:

```txt
database/sql/performance/46-create-cache-refresh-control.sql
```

Objetivo:

- Crear auditoria local `rr_gestion_soporte.cache_refresh_log`.
- Permitir que el backend ejecute refrescos manuales de caches.
- Mantener trazabilidad de inicio, termino, duracion, estado y conteos.

## Avance adicional: vencimiento CAF 33

Se agrego control local de vencimiento CAF para facturas electronicas tipo `33`.

Script:

```txt
database/sql/performance/47-create-caf-expiration-control.sql
```

Regla inicial:

- `FA` se extrae desde `xml_caf`.
- `caf_fecha_vencimiento = FA + 6 meses`.
- `WARNING` si vence dentro de 30 dias.
- `URGENTE` si esta vencido o vence hoy.

La cache de alertas incorpora fuente:

```txt
CAF_VENCIMIENTO
```

Regla:

- El refresco debe requerir confirmacion explicita.
- Debe recalcular primero tablas temporales.
- Solo despues debe reemplazar caches locales dentro de una transaccion.
- Si falla, la transaccion debe revertir el cambio y registrar error.

## Decisiones pendientes

- Si usaremos tablas cache actualizables por proceso manual o materialized views locales.
- Si se permitira extension local `pg_trgm` para busqueda textual rapida.
- Si el front debe cargar todos los modulos al iniciar o solo Torre de Control.
- Periodicidad de recalculo: manual, diaria, al iniciar backend o boton controlado.

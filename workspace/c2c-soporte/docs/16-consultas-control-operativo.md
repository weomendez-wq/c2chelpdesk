# Consultas control operativo

## Objetivo

Mantener en un solo documento las consultas SQL que:

- Se ejecutan actualmente desde backend/frontend.
- Se usaran para certificar numeros por tabla antes de mezclar relaciones.
- Se incorporaran como base para alertas operativas.

La regla de trabajo es avanzar en orden:

```txt
1. Cuadrar una tabla base
2. Cuadrar relaciones directas
3. Comparar contra documentos emitidos
4. Generar advertencias
5. Recien despues exponer indicadores en frontend
```

## Principio de seguridad de informacion

No se debe mostrar una metrica combinada sin poder explicar desde que tabla sale y como cuadra.

Ejemplo:

```txt
empresa total = activas + desactivadas + otros estados
```

Si el total no cuadra, no se debe avanzar a relaciones con `device`, `caf`, `folios` o `documentos`.

## Queries actuales del backend

Archivo:

```txt
backend/src/modules/support/support.service.ts
```

### `GET /api/support/companies`

```sql
SELECT *
FROM rr_gestion_soporte.empresas_resumen
-- filtros opcionales:
-- WHERE tenant_id = $1
-- WHERE empresa_status = $2
-- WHERE empresa_name ILIKE $n OR rut::text ILIKE $n OR tenant_name ILIKE $n
ORDER BY empresa_name ASC
LIMIT $n OFFSET $n;
```

### `GET /api/support/devices`

```sql
SELECT *
FROM rr_gestion_soporte.dispositivos_resumen
-- filtros opcionales:
-- WHERE tenant_id = $1
-- WHERE device_status = $2
-- WHERE device_name ILIKE $n OR device_id ILIKE $n OR local ILIKE $n
ORDER BY device_name ASC NULLS LAST, device_id ASC
LIMIT $n OFFSET $n;
```

### `GET /api/support/company-devices`

```sql
SELECT *
FROM rr_gestion_soporte.empresa_dispositivo_resumen
-- filtros opcionales:
-- WHERE tenant_id = $1
-- WHERE rut = $2
-- WHERE device_status = $3
-- WHERE empresa_name ILIKE $n OR rut::text ILIKE $n OR device_name ILIKE $n OR device_id ILIKE $n
ORDER BY empresa_name ASC, device_name ASC NULLS LAST
LIMIT $n OFFSET $n;
```

## Vistas actuales

Archivo:

```txt
database/sql/22-create-base-support-views.sql
```

Vistas:

- `rr_gestion_soporte.empresas_resumen`
- `rr_gestion_soporte.dispositivos_resumen`
- `rr_gestion_soporte.empresa_dispositivo_resumen`

Estas vistas sirven para navegacion inicial, pero no son suficientes para certificar folios, CAF, documentos emitidos ni alertas.

## Estado base observado

Fecha de extraccion:

```txt
2026-05-15
```

### Empresas

```sql
SELECT
  count(*) AS empresas,
  count(*) FILTER (WHERE status = 'active') AS activas,
  count(*) FILTER (WHERE status <> 'active' OR status IS NULL) AS no_activas
FROM staging_public.empresa;
```

Resultado observado:

```txt
empresas: 86
activas: 86
no_activas: 0
cuadratura: OK
```

Detalle por estado:

```sql
SELECT status, count(*)
FROM staging_public.empresa
GROUP BY status
ORDER BY status;
```

Resultado observado:

```txt
active: 86
```

### Devices

```sql
SELECT
  count(*) AS devices,
  count(*) FILTER (WHERE status = 'active') AS activos,
  count(*) FILTER (WHERE status <> 'active' OR status IS NULL) AS no_activos
FROM staging_public.device;
```

Resultado observado:

```txt
devices: 402
activos: 349
no_activos: 53
cuadratura: OK
```

Detalle por estado:

```sql
SELECT status, count(*)
FROM staging_public.device
GROUP BY status
ORDER BY status;
```

Resultado observado:

```txt
active: 349
disabled: 50
suspended: 3
```

### CAF

```sql
SELECT
  count(*) AS caf_count,
  coalesce(sum(folio_fin - folio_ini + 1), 0) AS folios_otorgados
FROM staging_public.caf;
```

Resultado observado:

```txt
caf_count: 374
folios_otorgados: 53.608.759
```

Detalle por tipo de documento:

```sql
SELECT
  document_type,
  count(*) AS caf_count,
  coalesce(sum(folio_fin - folio_ini + 1), 0) AS folios_otorgados
FROM staging_public.caf
GROUP BY document_type
ORDER BY document_type;
```

Resultado observado:

```txt
33: 11 CAF / 6.760 folios
39: 359 CAF / 53.438.999 folios
41: 4 CAF / 163.000 folios
```

### Historial asignacion folios

```sql
SELECT
  count(*) AS historial_cargas,
  coalesce(sum(folio_fin - folio_ini + 1), 0) AS folios_asignados,
  coalesce(sum(cantidad_solicitada), 0) AS cantidad_solicitada
FROM staging_public.historialasignacionfolios;
```

Resultado observado:

```txt
historial_cargas: 17.253
folios_asignados: 22.933.100
cantidad_solicitada: 22.992.275
alerta: folios_asignados no cuadra con cantidad_solicitada
```

### Documentos emitidos 2026

```sql
SELECT count(*) AS documentos_emitidos
FROM rr_gestion_soporte.documentos_2026;
```

Resultado observado:

```txt
documentos_emitidos: 3.919.488
```

### Empresas con o sin documentos emitidos

```sql
SELECT
  count(*) FILTER (WHERE doc_count = 0) AS empresas_sin_documentos,
  count(*) FILTER (WHERE doc_count > 0) AS empresas_con_documentos
FROM (
  SELECT
    e.tenant_id,
    e.rut,
    count(d.*) AS doc_count
  FROM staging_public.empresa e
  LEFT JOIN rr_gestion_soporte.documentos_2026 d
    ON d.tenant_id = e.tenant_id
   AND d.rut = e.rut
  GROUP BY e.tenant_id, e.rut
) s;
```

Resultado observado:

```txt
empresas_sin_documentos: 18
empresas_con_documentos: 68
```

## Consultas a incorporar por orden funcional

### 1. Certificacion `empresa`

```sql
WITH estado AS (
  SELECT
    coalesce(status, 'SIN_ESTADO') AS status,
    count(*) AS cantidad
  FROM staging_public.empresa
  GROUP BY coalesce(status, 'SIN_ESTADO')
),
total AS (
  SELECT count(*) AS cantidad_total
  FROM staging_public.empresa
)
SELECT
  t.cantidad_total,
  sum(e.cantidad) AS cantidad_por_estado,
  t.cantidad_total = sum(e.cantidad) AS cuadratura_ok
FROM total t
CROSS JOIN estado e
GROUP BY t.cantidad_total;
```

### 2. Tiempo operativo empresa

```sql
SELECT
  e.tenant_id,
  e.rut,
  e.name AS empresa_name,
  min(to_date(nullif(d.fechaemision, ''), 'YYYY-MM-DD')) AS primera_emision,
  max(to_date(nullif(d.fechaemision, ''), 'YYYY-MM-DD')) AS ultima_emision,
  current_date - min(to_date(nullif(d.fechaemision, ''), 'YYYY-MM-DD')) AS dias_desde_primera_emision,
  current_date - max(to_date(nullif(d.fechaemision, ''), 'YYYY-MM-DD')) AS dias_sin_emitir,
  count(d.*) AS documentos_emitidos
FROM staging_public.empresa e
LEFT JOIN rr_gestion_soporte.documentos_2026 d
  ON d.tenant_id = e.tenant_id
 AND d.rut = e.rut
GROUP BY e.tenant_id, e.rut, e.name
ORDER BY dias_sin_emitir DESC NULLS FIRST, documentos_emitidos ASC;
```

Nota:

- Esta version usa `fechaemision` como fecha.
- Si se requiere hora exacta, se debe normalizar `fechahora` o `horacliente` en una vista posterior.

### 3. Empresas configuradas sin documentos emitidos

```sql
SELECT
  e.tenant_id,
  e.rut,
  e.name AS empresa_name,
  e.status AS empresa_status,
  count(d.*) AS documentos_emitidos,
  'WARNING' AS alerta
FROM staging_public.empresa e
LEFT JOIN rr_gestion_soporte.documentos_2026 d
  ON d.tenant_id = e.tenant_id
 AND d.rut = e.rut
WHERE e.status = 'active'
GROUP BY e.tenant_id, e.rut, e.name, e.status
HAVING count(d.*) = 0
ORDER BY e.name;
```

### 4. Empresas con tiempo sin emitir

Umbrales iniciales propuestos:

```txt
OK: 0 a 2 dias sin emitir
WARNING: 3 a 6 dias sin emitir
URGENTE: 7 o mas dias sin emitir
SIN_EMISION: sin documentos emitidos
```

```sql
WITH actividad AS (
  SELECT
    e.tenant_id,
    e.rut,
    e.name AS empresa_name,
    max(to_date(nullif(d.fechaemision, ''), 'YYYY-MM-DD')) AS ultima_emision,
    count(d.*) AS documentos_emitidos
  FROM staging_public.empresa e
  LEFT JOIN rr_gestion_soporte.documentos_2026 d
    ON d.tenant_id = e.tenant_id
   AND d.rut = e.rut
  WHERE e.status = 'active'
  GROUP BY e.tenant_id, e.rut, e.name
)
SELECT
  *,
  current_date - ultima_emision AS dias_sin_emitir,
  CASE
    WHEN documentos_emitidos = 0 THEN 'SIN_EMISION'
    WHEN current_date - ultima_emision >= 7 THEN 'URGENTE'
    WHEN current_date - ultima_emision >= 3 THEN 'WARNING'
    ELSE 'OK'
  END AS nivel_alerta
FROM actividad
ORDER BY nivel_alerta DESC, dias_sin_emitir DESC NULLS FIRST;
```

### 5. CAF por empresa y tipo documento

```sql
SELECT
  c.tenant_id,
  c.rut,
  e.name AS empresa_name,
  c.document_type,
  count(*) AS caf_count,
  sum(c.folio_fin - c.folio_ini + 1) AS folios_otorgados,
  min(c.created_at) AS primer_caf,
  max(c.created_at) AS ultimo_caf
FROM staging_public.caf c
LEFT JOIN staging_public.empresa e
  ON e.tenant_id = c.tenant_id
 AND e.rut = c.rut
GROUP BY c.tenant_id, c.rut, e.name, c.document_type
ORDER BY e.name, c.document_type;
```

### 6. Historial folios por empresa, device y tipo documento

```sql
SELECT
  h.tenant_id,
  h.rut,
  e.name AS empresa_name,
  h.device_id,
  h.document_type,
  count(*) AS cargas_historial,
  sum(h.folio_fin - h.folio_ini + 1) AS folios_entregados_por_rango,
  sum(h.cantidad_solicitada) AS folios_solicitados,
  sum(h.cantidad_solicitada) - sum(h.folio_fin - h.folio_ini + 1) AS diferencia,
  CASE
    WHEN sum(h.cantidad_solicitada) = sum(h.folio_fin - h.folio_ini + 1) THEN 'OK'
    ELSE 'ALERTA'
  END AS cuadratura
FROM staging_public.historialasignacionfolios h
LEFT JOIN staging_public.empresa e
  ON e.tenant_id = h.tenant_id
 AND e.rut = h.rut
GROUP BY h.tenant_id, h.rut, e.name, h.device_id, h.document_type
ORDER BY abs(sum(h.cantidad_solicitada) - sum(h.folio_fin - h.folio_ini + 1)) DESC;
```

### 7. Folios disponibles por empresa y tipo documento

Umbrales iniciales propuestos:

```txt
OK: mas de 30.000 folios disponibles
WARNING: 10.001 a 30.000 folios disponibles
URGENTE: 0 a 10.000 folios disponibles
SIN_FOLIOS: sin registros disponibles
```

```sql
SELECT
  fd.tenant_id,
  fd.rut,
  e.name AS empresa_name,
  fd.document_type,
  sum(fd.folio_fin - fd.folio_ini + 1) AS folios_disponibles,
  CASE
    WHEN sum(fd.folio_fin - fd.folio_ini + 1) <= 10000 THEN 'URGENTE'
    WHEN sum(fd.folio_fin - fd.folio_ini + 1) <= 30000 THEN 'WARNING'
    ELSE 'OK'
  END AS nivel_alerta
FROM staging_public.foliosdisponibles fd
LEFT JOIN staging_public.empresa e
  ON e.tenant_id = fd.tenant_id
 AND e.rut = fd.rut
GROUP BY fd.tenant_id, fd.rut, e.name, fd.document_type
ORDER BY folios_disponibles ASC;
```

### 8. Documentos emitidos por empresa, device y tipo documento

```sql
SELECT
  d.tenant_id,
  d.rut,
  e.name AS empresa_name,
  d.device_id,
  d.tipodocumento,
  count(*) AS documentos_emitidos,
  min(to_date(nullif(d.fechaemision, ''), 'YYYY-MM-DD')) AS primera_emision,
  max(to_date(nullif(d.fechaemision, ''), 'YYYY-MM-DD')) AS ultima_emision
FROM rr_gestion_soporte.documentos_2026 d
LEFT JOIN staging_public.empresa e
  ON e.tenant_id = d.tenant_id
 AND e.rut = d.rut
GROUP BY d.tenant_id, d.rut, e.name, d.device_id, d.tipodocumento
ORDER BY documentos_emitidos DESC;
```

### 9. Device: certificacion de estados

```sql
WITH estado AS (
  SELECT
    coalesce(status, 'SIN_ESTADO') AS status,
    count(*) AS cantidad
  FROM staging_public.device
  GROUP BY coalesce(status, 'SIN_ESTADO')
),
total AS (
  SELECT count(*) AS cantidad_total
  FROM staging_public.device
)
SELECT
  t.cantidad_total,
  sum(e.cantidad) AS cantidad_por_estado,
  t.cantidad_total = sum(e.cantidad) AS cuadratura_ok
FROM total t
CROSS JOIN estado e
GROUP BY t.cantidad_total;
```

### 10. Device: tiempo sin emitir

```sql
WITH actividad AS (
  SELECT
    dev.tenant_id,
    dev.device_id,
    dev.name AS device_name,
    dev.status AS device_status,
    count(d.*) AS documentos_emitidos,
    min(to_date(nullif(d.fechaemision, ''), 'YYYY-MM-DD')) AS primera_emision,
    max(to_date(nullif(d.fechaemision, ''), 'YYYY-MM-DD')) AS ultima_emision
  FROM staging_public.device dev
  LEFT JOIN rr_gestion_soporte.documentos_2026 d
    ON d.tenant_id = dev.tenant_id
   AND d.device_id = dev.device_id
  GROUP BY dev.tenant_id, dev.device_id, dev.name, dev.status
)
SELECT
  *,
  current_date - ultima_emision AS dias_sin_emitir,
  CASE
    WHEN documentos_emitidos = 0 THEN 'SIN_EMISION'
    WHEN current_date - ultima_emision >= 7 THEN 'URGENTE'
    WHEN current_date - ultima_emision >= 3 THEN 'WARNING'
    ELSE 'OK'
  END AS nivel_alerta
FROM actividad
ORDER BY nivel_alerta DESC, dias_sin_emitir DESC NULLS FIRST;
```

## Alertas iniciales a modelar

### Empresa configurada sin emision

```txt
empresa.status = active
documentos_emitidos = 0
```

Nivel:

```txt
WARNING inicial
```

### Empresa activa sin emitir por umbral

```txt
3 a 6 dias: WARNING
7 o mas dias: URGENTE
```

### Device activo sin emitir por umbral

```txt
3 a 6 dias: WARNING
7 o mas dias: URGENTE
```

### Folios disponibles bajos

```txt
10.001 a 30.000: WARNING
0 a 10.000: URGENTE
```

### Folios no cuadran

Casos:

- CAF otorgados no cuadra con historial asignado.
- Historial solicitado no cuadra con rango asignado.
- Folios asignados no cuadra con documentos emitidos mas saldo esperado.
- Device con folios asignados en historial pero sin emision.

Nivel:

```txt
ALERTA_REVISION_DATOS
```

## Siguiente paso recomendado

Antes de cambiar el frontend, crear vistas SQL nuevas en este orden:

```txt
1. rr_gestion_soporte.empresa_control_resumen
2. rr_gestion_soporte.device_control_resumen
3. rr_gestion_soporte.folios_control_resumen
4. rr_gestion_soporte.alertas_operativas_resumen
```

Despues exponer endpoints separados:

```txt
GET /api/support/control/companies
GET /api/support/control/devices
GET /api/support/control/folios
GET /api/support/control/alerts
GET /api/support/control/documents-summary
```

El frontend debe consumir estas vistas por bloque y no mezclar todo en una sola tabla.

## Vistas implementadas - folios y CAF

Archivos:

```txt
database/sql/30-create-folios-operational-views.sql
database/sql/31-verify-folios-operational-views.sql
```

Vistas:

- `rr_gestion_soporte.folios_caf_resumen`
- `rr_gestion_soporte.folios_disponibles_resumen`
- `rr_gestion_soporte.folios_historial_resumen`
- `rr_gestion_soporte.folios_control_resumen`

Fuentes locales:

- `staging_public.caf`
- `staging_public.foliosdisponibles`
- `staging_public.historialasignacionfolios`
- `rr_gestion_soporte.documentos_2026_normalizados`

Alertas iniciales:

```txt
REVISION_DATOS
SIN_FOLIOS
URGENTE
WARNING
OK
```

Validacion local:

```txt
CAF: 374
folios_otorgados: 53.608.759
rangos_disponibles: 102
folios_disponibles: 10.738.125
cargas_historial: 17.253
folios_entregados_por_rango: 22.933.100
folios_solicitados: 22.992.275
diferencia_solicitado_rango: 59.175

alertas:
REVISION_DATOS: 21 combinaciones
WARNING: 8 combinaciones
OK: 58 combinaciones
```

Observacion:

`REVISION_DATOS` nace principalmente por diferencias entre `cantidad_solicitada` y rango entregado en historial. Estos casos deben ser indagados antes de usarlos como alerta operacional final para usuarios.

## Endpoint implementado - control companies

```txt
GET /api/support/control/companies
```

Fuente:

```txt
rr_gestion_soporte.empresa_control_resumen
```

Filtros:

- `limit`
- `offset`
- `search`
- `status`
- `tenantId`
- `rut`
- `alert`

## Endpoint planificado - documents summary

```txt
GET /api/support/control/documents-summary
```

Filtros:

- `tenantId`
- `rut`

Consulta total anual:

```sql
SELECT count(*) AS total_rows
FROM rr_gestion_soporte.documentos_2026;
```

Consulta mensual:

```sql
SELECT periodo, count(*) AS rows_count
FROM rr_gestion_soporte.documentos_2026
GROUP BY periodo
ORDER BY periodo;
```

Respuesta backend esperada:

```txt
totals.documents
totals.companies
totals.devices
totals.documentTypes
monthly[]
byDocumentType[]
```

Version filtrada por empresa:

```sql
SELECT periodo, count(*) AS rows_count
FROM rr_gestion_soporte.documentos_2026
WHERE tenant_id = $1
  AND rut = $2
GROUP BY periodo
ORDER BY periodo;
```

## Vista implementada - empresa control

Archivos:

```txt
database/sql/24-create-empresa-control-resumen.sql
database/sql/25-verify-empresa-control-resumen.sql
```

Objetivo:

- Certificar empresas como primer dominio aislado.
- Calcular actividad 2026 por empresa.
- Generar alerta inicial por falta de emision o tiempo sin emitir.

Campos principales:

- `tenant_id`
- `rut`
- `empresa_name`
- `empresa_status`
- `documentos_emitidos_2026`
- `primera_emision`
- `ultima_emision`
- `dias_desde_primera_emision`
- `dias_sin_emitir`
- `nivel_alerta_emision`

Validacion local:

```txt
empresas: 86
activas: 86
no_activas: 0
cuadratura_estado_ok: true
OK: 60
SIN_EMISION: 18
URGENTE: 8
```

## Endpoint implementado - control folios

```txt
GET /api/support/control/folios
```

Fuente:

```txt
rr_gestion_soporte.folios_control_resumen
```

Filtros:

- `limit`
- `offset`
- `search`
- `tenantId`
- `rut`
- `documentType`
- `alert`

Orden:

```txt
REVISION_DATOS
SIN_FOLIOS
URGENTE
WARNING
OK
```

Uso inicial:

- Mostrar cards compactas de CAF, folios otorgados, disponibles y alertas.
- Al seleccionar empresa, acotar por `tenantId` y `rut`.
- Indagar primero las combinaciones `REVISION_DATOS` antes de convertirlas en alarma final de usuario.

Validacion API local:

```txt
GET /api/support/control/folios?limit=3&offset=0
total: 87
primeros registros: REVISION_DATOS

GET /api/support/control/folios?limit=2&offset=0&alert=WARNING
total: 8
primeros registros: WARNING
```

Observacion de rendimiento:

La consulta inicial puede tardar varios segundos porque `folios_control_resumen` compara CAF, disponibles, historial y documentos 2026. Antes de convertir esto en vista principal de uso intensivo, evaluar una agregacion local optimizada o materializada en `rr_gestion_soporte`, nunca en `public`.

# Analisis querys a integrar

## Objetivo

Analizar los scripts ubicados en:

```txt
database/integrar/
```

antes de ejecutarlos o incorporarlos al flujo oficial del proyecto.

## Criterio

No ejecutar scripts heredados directamente contra la base local si:

- Hacen `DROP TABLE` o `DROP MATERIALIZED VIEW`.
- Insertan datos masivos sin control de origen.
- Referencian tablas o funciones que no existen en la base local.
- Usan nombres historicos distintos a los normalizados del proyecto actual.

## Estado local verificado

Base local:

```txt
soporte
localhost:5434
```

Objetos existentes relevantes:

```txt
rr_gestion_soporte.documentos_2026
staging_public.device
staging_public.deviceconfiggroup
staging_public.tenant
```

Objetos esperados por scripts heredados que no existen actualmente:

```txt
documentos
rr_gestion_soporte.gsoporte_device
rr_gestion_soporte.gsoporte_tenant
rr_gestion_soporte.gsoporte_deviceconfiggroup
rr_gestion_soporte.gsoporte_safe_parse_timestamp
```

Conclusion:

```txt
Los scripts no deben ejecutarse directamente. Requieren adaptacion a la base local actual.
```

## Inventario de scripts

### Grupo A - Normalizacion documental y facts

Archivos:

```txt
created_ok_documentos_normalizados.sql
created_ok_documentos_normalizados_ver.sql
created_ok_documentos_normalizados2.sql
created_ok_documentos_normalizados_ranking_carga_incremental.sql
created_ok_documentos_normalizados_ver_promedios_avg.sql
ok_vw_datos_device_casi_todo.sql
```

Proposito observado:

- Crear `dim_device`.
- Crear `fact_documentos_normalizados`.
- Crear `fact_docs_aggregados`.
- Crear materialized views de actividad, metricas, tendencia y score de cajeros.
- Preparar carga incremental mediante `etl_control`.

Riesgos:

- Varios scripts hacen `DROP TABLE`.
- Referencian `documentos`, no `rr_gestion_soporte.documentos_2026`.
- Referencian `rr_gestion_soporte.gsoporte_device`, no `staging_public.device`.
- Dependen de `rr_gestion_soporte.gsoporte_safe_parse_timestamp`, que no existe localmente.
- Algunos scripts son versiones alternativas del mismo objetivo; no se debe integrar todo sin consolidar.

Recomendacion:

- No ejecutar estos scripts directamente.
- Consolidar una version oficial nueva, adaptada a:
  - `rr_gestion_soporte.documentos_2026`
  - `staging_public.device`
  - `staging_public.tenant`
  - parser de fecha controlado dentro del script o funcion nueva versionada.

### Grupo B - Total mensual documentos

Archivo:

```txt
created_ok_mv_total_documentos_agrupados_periodo_mensual.sql
```

Proposito observado:

- Crear materialized view mensual por `tenant_id`.

Riesgos:

- Referencia `documentos`.
- Usa `gsoporte_safe_parse_timestamp`.
- Es conceptualmente similar al endpoint ya creado `GET /api/support/control/documents-summary`.

Recomendacion:

- Integrar la idea, no el script literal.
- Primero validar si el endpoint actual cubre la necesidad.
- Si se requiere performance, crear una vista/materialized view oficial desde `rr_gestion_soporte.documentos_2026`.

### Grupo C - Monitoreo cajeros/devices

Archivos:

```txt
rr_gestion_soporte.mv_vc_monitoreo_cajeros.sql
rr_gestion_soporte.mv_vc_monitoreo_cajeros2.sql
rr_gestion_soporte.mv_vc_monitoreo_cajeros3.sql
rr_gestion_soporte.select_tenant_id_detalle_health_cajero.sql
rr_gestion_soporte.select_tenant_id_detalle_health_cajero2.sql
rr_gestion_soporte.select_tenant_id_severidad_health_cajero.sql
rr_gestion_soporte.select_cajero_cant__tipo_doc_emitido.sql
rr_gestion_soporte.select_cajero_cant__tipo_doc_emitido_intervalo_3months.sql
rr_gestion_soporte.select_cajero_cant__tipo_doc_emitido_proyeccion_doc.sql
rr_gestion_soporte.select_por_cajero_tipodoc_cant_diaria_intervalo_3months.sql
rr_gestion_soporte.select_por_cajero_tipodoc_cant_diaria_intervalo_3months_ranking_malo.sql
```

Proposito observado:

- Health de cajeros/devices.
- Cantidad emitida por cajero.
- Ranking mensual.
- Severidad por inactividad.
- Proyeccion de documentos.

Riesgos:

- Referencian objetos historicos `gsoporte_*`.
- Referencian `documentos`.
- Algunos nombres indican que son pruebas o versiones no definitivas, por ejemplo `ranking_malo`.
- Mezclan logica de negocio, presentacion y consultas exploratorias.

Recomendacion:

- No integrarlos como estan.
- Extraer reglas utiles:
  - dias sin emision por device.
  - estado operacional.
  - ranking mensual.
  - promedio mensual.
  - consistencia device activo sin emision.
- Convertir esas reglas a vistas oficiales posteriores:
  - `rr_gestion_soporte.device_control_resumen`
  - `rr_gestion_soporte.device_emision_mensual`
  - `rr_gestion_soporte.device_alertas_resumen`

## Mapeo requerido

| Nombre heredado | Nombre local actual |
| --- | --- |
| `documentos` | `rr_gestion_soporte.documentos_2026` |
| `rr_gestion_soporte.gsoporte_device` | `staging_public.device` |
| `rr_gestion_soporte.gsoporte_tenant` | `staging_public.tenant` |
| `rr_gestion_soporte.gsoporte_deviceconfiggroup` | `staging_public.deviceconfiggroup` |
| `gsoporte_safe_parse_timestamp` | pendiente crear o reemplazar por parser controlado |

## Propuesta de integracion

### Fase 1 - Adaptacion segura documental

Crear scripts nuevos, no destructivos:

```txt
database/sql/26-create-documentos-normalizados-support.sql
database/sql/27-verify-documentos-normalizados-support.sql
```

Objetivo:

- Crear una capa normalizada local desde `rr_gestion_soporte.documentos_2026`.
- No tocar los scripts heredados.
- Evitar `DROP TABLE` destructivo.
- Validar conteos contra `documentos_2026`.

Objetos propuestos:

```txt
rr_gestion_soporte.documentos_2026_normalizados
rr_gestion_soporte.documentos_2026_mensual
rr_gestion_soporte.documentos_2026_device_mensual
```

### Fase 2 - Control device

Crear:

```txt
database/sql/28-create-device-control-resumen.sql
database/sql/29-verify-device-control-resumen.sql
```

Objetivo:

- Total devices.
- Activos, disabled, suspended.
- Primera y ultima emision por device.
- Dias sin emitir.
- Estado operacional.
- Tenant y rut asociado cuando exista.

### Fase 3 - Alertas operativas

Crear:

```txt
database/sql/30-create-alertas-operativas-resumen.sql
database/sql/31-verify-alertas-operativas-resumen.sql
```

Objetivo:

- Empresas sin emision.
- Devices activos sin emision.
- Devices inactivos con emision.
- Devices con caida por umbral.
- Empresas con devices configurados pero sin documentos.

### Fase 4 - Performance

Evaluar materialized views solo cuando:

- La consulta dinamica sea lenta.
- Se confirme frecuencia de refresco.
- Exista procedimiento de refresh documentado.

No crear materialized views por defecto.

## Decision recomendada

Integrar primero la logica de `created_ok_mv_total_documentos_agrupados_periodo_mensual.sql` y de monitoreo de cajeros, pero reescrita contra objetos locales actuales.

Orden recomendado:

```txt
1. documentos_2026_normalizados
2. documentos_2026_mensual
3. documentos_2026_device_mensual
4. device_control_resumen
5. device_alertas_resumen
```

## Pendiente antes de implementar

- Confirmar si `database/integrar/` debe quedar versionado como insumo historico o si se debe dejar fuera y solo versionar scripts adaptados.
- Definir si se crea una funcion oficial para parseo seguro de fechas.
- Decidir si la capa normalizada sera `VIEW`, `TABLE` o `MATERIALIZED VIEW`.

## Limpieza preventiva aplicada

Fecha:

```txt
2026-05-15
```

Accion:

```txt
Se quitaron todas las lineas que contenian DROP dentro de database/integrar/*.sql.
```

Validacion:

```txt
Sin coincidencias para DROP en database/integrar/*.sql.
Sin referencias a public en database/integrar/*.sql.
```

Observacion:

- Los scripts siguen siendo insumos de analisis, no scripts aprobados para ejecucion.
- Aun quedan sentencias `UPDATE`, `ALTER` y `ON CONFLICT DO UPDATE`, que se revisaran en la siguiente etapa.
- No se elimino ningun archivo.

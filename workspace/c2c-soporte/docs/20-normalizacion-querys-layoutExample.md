# Normalizacion de querys desde layoutExample

Fecha: 2026-05-16

## Objetivo

Rescatar la informacion funcional y tecnica agregada en `layoutExample` sin ejecutar codigo historico ni perder conocimiento cuando esa carpeta sea eliminada.

El resultado de este analisis debe servir para:

- Normalizar querys del proyecto actual.
- Completar metricas faltantes de soporte.
- Reutilizar ideas de layout/componentes.
- Mantener la regla critica de no modificar `public`.

## Regla critica

Los archivos de `layoutExample` son referencia historica. No se deben ejecutar directamente.

Queda prohibido ejecutar contra `dte.public` o `public` cualquier accion de:

- `DROP`
- `CREATE`
- `ALTER`
- `INSERT`
- `UPDATE`
- `DELETE`
- `TRUNCATE`
- `GRANT`
- `REFRESH`
- indices, triggers, owners, locks o funciones con efectos laterales

La normalizacion para este proyecto debe llevarse a objetos locales en:

```txt
rr_gestion_soporte
staging_public
```

## Fuentes revisadas

### Frontend historico

Carpetas:

```txt
layoutExample/c2c-gestion-soporte-front
layoutExample/c2c-gestion-soporte-front_OK
```

Documentos relevantes:

```txt
docs/query-map.md
docs/global-metrics-contract.md
docs/DB_GUARDRAILS.md
docs/DOMAIN_MODEL_ALIGNMENT.md
docs/PROCESS_FLOW.md
```

Componentes y modulos relevantes:

```txt
src/shared/components/TenantSelector.jsx
src/shared/components/ContactoSelector.jsx
src/shared/components/PaginationBar.jsx
src/shared/components/MetricCard.jsx
src/shared/components/ui/DataTable.jsx
src/modules/global/pages/GlobalPage.jsx
src/modules/caf/pages/CafPage.jsx
src/modules/empresa/pages/EmpresaPage.jsx
src/modules/device/DevicePage.jsx
src/modules/documentos/pages/DocumentosPage.jsx
```

### Funciones historicas

Carpeta:

```txt
layoutExample/FUNCIONES_C2C_SOPORTE
```

Bloques relevantes:

```txt
gestionFolios/
gestion_folios_base_/
definiciones_estructura/
funciones_clasificacion/
funciones_debug/
funciones_subprocesos/
funciones_utiles/
main_controladores/
```

## Lo que ya esta cubierto en el proyecto actual

### Empresas

Objeto actual:

```txt
rr_gestion_soporte.empresa_control_resumen
```

Cubre:

- Total de empresas.
- Empresas activas e inactivas.
- Tenant, RUT y nombre.
- Estado operacional inicial.
- Ultima actividad documental.
- Base para selector por empresa/tenant.

### Documentos 2026

Objetos actuales:

```txt
rr_gestion_soporte.documentos_2026
rr_gestion_soporte.documentos_2026_normalizados
rr_gestion_soporte.documentos_2026_mensual
rr_gestion_soporte.documentos_2026_device_mensual
```

Cubre:

- Total documentos del ano.
- Total por periodo/mes.
- Total por empresa.
- Total por device/cajero.
- Primera y ultima emision.
- Filtros por tenant, RUT y busqueda.

### Devices / cajeros

Objetos actuales:

```txt
rr_gestion_soporte.device_control_resumen
rr_gestion_soporte.cajero_emision_mensual
rr_gestion_soporte.cajero_control_resumen
```

Cubre:

- Devices activos/inactivos.
- Estado tecnico.
- Estado operacional por emision.
- Dias sin emitir.
- Primer y ultimo folio emitido por cajero.
- Emision mensual.
- Ranking por tenant.

### CAF y folios

Objetos actuales:

```txt
rr_gestion_soporte.folios_caf_resumen
rr_gestion_soporte.folios_disponibles_resumen
rr_gestion_soporte.folios_historial_resumen
rr_gestion_soporte.folios_control_resumen
rr_gestion_soporte.folios_proyeccion_agotamiento
rr_gestion_soporte.folios_rangos_estado
```

Cubre:

- CAF cargados.
- Folios otorgados.
- Folios disponibles.
- Historial de cargas.
- Diferencias entre cantidad solicitada y rango entregado.
- Documentos emitidos asociados.
- Proyeccion de agotamiento.
- Rangos `POR_OCUPAR`, `EN_USO`, `AGOTADO`, `CADUCADO_CANDIDATO`.

## Informacion historica que falta normalizar

### 1. Resumen extendido por empresa

Origen historico:

```txt
rr_gestion_folios.resumen_empresas
generar_resumen_empresas.functions
asdasd.txt
```

Metricas a rescatar:

- `total_documentos`
- `total_folios_autorizados`
- `total_folios_utilizados`
- `total_folios_por_utilizar`
- `total_tipos_documento`
- `total_rangos_cargados`
- `total_rangos_utilizados`
- `total_rangos_datos_en_documento`
- `total_documentos_sin_caf`
- `folio_min`
- `folio_max`
- `total_folios_ocupados`
- `total_folios_disponibles`

Objeto local sugerido:

```txt
rr_gestion_soporte.folios_resumen_empresa_extendido
```

Uso:

- Cards compactas al seleccionar empresa.
- Cuadratura empresa completa.
- Deteccion de documentos sin respaldo CAF.

### 2. Rangos clasificados de folios

Origen historico:

```txt
gestionFolios/funciones_rr/20250714_rr_gestion_folios_rprocesar_rangos_clasificados.sql
gestionFolios/tablas_rr/estructura_rtbl_gdata_rangos_clasificados.sql
funciones_clasificacion/rrv1_clasificar_y_transferir_tramos_folios.sql
funciones_subprocesos/rrv1_subf_identificar_folio_mayor.sql
funciones_subprocesos/rrv1_subf_generar_tramos_folios.sql
```

Campos y formulas a rescatar:

- `estado_rango`
- `clasificacion_temporal`
- `caf_resultado`
- `total_rango`
- `total_ocupado`
- `total_documentos_desocupados`
- `lost_folios`
- `folio_mayor`
- `folio_mayor_global`
- `fecha_ultima_emision`

Estados historicos relevantes:

```txt
RANGOSINUSO
RANGOOCUPADO
RANGOCARGAPARCIAL
RANGOFUTURO
RANGOACTUAL
RANGOANTERIOR
SINCLASIFICACION
```

Objeto local sugerido:

```txt
rr_gestion_soporte.folios_rangos_clasificados_detalle
```

Uso:

- Ver rangos sin uso.
- Detectar rangos antiguos parcialmente ocupados.
- Separar rango actual, futuro y anterior.
- Preparar gestion posterior de rangos candidatos a deshabilitar en SII.

### 3. Documentos sin CAF

Origen historico:

```txt
total_documentos_sin_caf
lost_folios
gsoporte_mv_folios_zombie*.csv
```

Objeto local sugerido:

```txt
rr_gestion_soporte.documentos_sin_caf_resumen
```

Uso:

- Alertar documentos emitidos sin rango CAF identificable.
- Revisar errores de normalizacion por tenant/RUT/tipo/folio.
- Cruzar contra rangos CAF e historial.

### 4. Resumen extendido por device/cajero

Origen historico:

```txt
rr_gestion_folios.resumen_devices.sql
rr_gestion_folios.resumen_devices_docs.sql
subf_resumen_devices.txt
subf_resumen_devices_docs.txt
```

Metricas a rescatar:

- Total documentos por device.
- Primer y ultimo folio por device.
- Primer y ultima emision por device.
- Rango actual por device.
- Folios ocupados por device.
- Folios disponibles por device cuando exista historial.

Objeto local sugerido:

```txt
rr_gestion_soporte.folios_resumen_device_extendido
```

Uso:

- Pantalla de cajeros.
- Analisis por empresa seleccionada.
- Deteccion de cajeros sin emision o con folios fuera de rango.

### 5. Diccionario de tipo DTE

Origen historico:

```txt
gestionFolios/tablas_rr/estructura_rtipodte.sql
```

Objeto local sugerido:

```txt
rr_gestion_soporte.tipodte_catalogo
```

Uso:

- Mostrar nombre legible del tipo de documento.
- Evitar que el frontend dependa solo de codigos `39`, `41`, etc.
- Centralizar filtros por tipo.

### 6. Auditoria y logs de procesos

Origen historico:

```txt
estructura_rtbl_log_procesos.sql
estructura_rtbl_log_validaciones.sql
estructura_rtbl_log_debug.sql
rrv1_log_acciones_folios.sql
rrv1_main_controlador_folios.sql
```

Objeto local sugerido:

```txt
rr_gestion_soporte.folios_proceso_log
rr_gestion_soporte.folios_validacion_log
```

Uso:

- Registrar ejecuciones manuales.
- Registrar resultados de validacion.
- Trazar errores de carga historica agregada.

No se debe implementar como primera prioridad si todavia estamos estabilizando querys de solo lectura.

### 7. Torre de control global

Origen historico:

```txt
GlobalPage.jsx
GlobalSupportDashboard.GOLDEN.jsx
global-metrics-contract.md
gsoporte_mv_admin_global_consolidado.csv
gsoporte_mv_documentos_kpi.csv
gsoporte_mv_device_estado.csv
gsoporte_mv_device_zombie.csv
gsoporte_mv_caf_resumen.csv
gsoporte_mv_folios_estado.csv
```

Campos esperados por la vista historica:

- `tenant_id`
- `empresa_nombre`
- `rut`
- `estado_global`
- `dias_desde_ultimo_doc`
- `folios_disponibles`
- `folios_emitidos`
- `total_folios`
- `devices_criticos`
- `devices_muertos`
- `devices_activos`
- `total_devices`
- `total_caf`
- `porcentaje_uso`
- `semaforo`
- `termometro`
- `fecha_primer_folio`
- `fecha_ultimo_folio`
- `document_type`

Objeto local sugerido:

```txt
rr_gestion_soporte.torre_control_empresa_resumen
```

Endpoint sugerido:

```txt
GET /api/support/control/global
```

Uso:

- Vista ejecutiva principal del departamento de soporte.
- Cards globales.
- Tabla priorizada por urgencia.
- Filtro por tenant/RUT.

## Contrato frontend a preservar

### Selectores

Componentes historicos:

```txt
TenantSelector
ContactoSelector
TicketClientSelector
```

Recomendacion:

- Usar `TenantSelector` como pieza central para filtrar toda la pantalla.
- Mostrar tenant, RUT y nombre juntos.
- Mantener busqueda por nombre, RUT y tenant.
- Agregar selector de contacto cuando pasemos a soporte/tickets.

### Tablas

Componentes historicos:

```txt
DataTable
PaginationBar
SkeletonTable
LoadingOverlay
```

Recomendacion:

- Normalizar todas las tablas con paginacion consistente.
- Mantener loading visible por bloque.
- Evitar tablas gigantes sin limite.
- Agregar orden visual por prioridad operativa.

### Cards

Componentes historicos:

```txt
MetricCard
SummaryCards
CacheIndicator
```

Recomendacion:

- Mostrar totales compactos arriba.
- Formatear numeros con separador de miles.
- Usar color solo para estado operativo, no como decoracion.
- Mantener helper corto bajo cada metrica.

### Exportacion

Componente historico:

```txt
ExportButton
```

Recomendacion:

- Agregar exportacion despues de estabilizar querys.
- Exportar resultados filtrados, no toda la base.
- Incluir timestamp y filtros aplicados.

## Mapeo seguro de origen a destino

| Historico | Proyecto actual |
| --- | --- |
| `public.empresa` | `staging_public.empresa` |
| `public.tenant` | `staging_public.tenant` |
| `public.device` | `staging_public.device` |
| `public.documentos` | `rr_gestion_soporte.documentos_2026_normalizados` o resumen anual read-only |
| `public.caf` | `staging_public.caf` |
| `public.historialasignacionfolios` | `staging_public.historialasignacionfolios` |
| `public.foliosdisponibles` | `staging_public.foliosdisponibles` |
| `rr_gestion_folios.*` | `rr_gestion_soporte.*` |
| `gsoporte_mv_*` | vistas locales `rr_gestion_soporte.*` o endpoints `/api/support/control/*` |

## Orden recomendado de normalizacion

1. Crear `documentos_sin_caf_resumen`.
2. Crear `folios_rangos_clasificados_detalle`.
3. Crear `folios_resumen_empresa_extendido`.
4. Crear `folios_resumen_device_extendido`.
5. Crear `torre_control_empresa_resumen`.
6. Exponer endpoints backend.
7. Integrar componentes frontend reutilizables.
8. Agregar exportacion y logs operativos.

## Siguiente implementacion SQL propuesta

Scripts sugeridos:

```txt
database/sql/34-create-folios-normalized-detail-views.sql
database/sql/35-verify-folios-normalized-detail-views.sql
```

Objetos iniciales:

```txt
rr_gestion_soporte.documentos_sin_caf_resumen
rr_gestion_soporte.folios_rangos_clasificados_detalle
rr_gestion_soporte.folios_resumen_empresa_extendido
rr_gestion_soporte.folios_resumen_device_extendido
```

Estos objetos deben ser `CREATE OR REPLACE VIEW` sobre datos locales. No deben escribir registros ni modificar origen.


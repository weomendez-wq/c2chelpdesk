# Referencia layoutExample para normalizacion de querys

Fecha: 2026-05-16

## Proposito

Esta carpeta documenta lo revisado en `layoutExample` para no perder informacion historica relevante cuando esa carpeta temporal sea eliminada.

No contiene una copia completa de `layoutExample` porque ahi existen:

- `node_modules`
- `dist`
- CSV con datos de ejemplo o salida operacional
- scripts SQL con acciones destructivas o de escritura
- referencias directas a `public`

La informacion consolidada vive en:

```txt
docs/20-normalizacion-querys-layoutExample.md
```

## Fuentes relevantes detectadas

### Contrato frontend

```txt
layoutExample/c2c-gestion-soporte-front/docs/query-map.md
layoutExample/c2c-gestion-soporte-front/docs/global-metrics-contract.md
layoutExample/c2c-gestion-soporte-front/docs/DB_GUARDRAILS.md
layoutExample/c2c-gestion-soporte-front/docs/DOMAIN_MODEL_ALIGNMENT.md
layoutExample/c2c-gestion-soporte-front/docs/PROCESS_FLOW.md
```

### Componentes reutilizables

```txt
TenantSelector.jsx
ContactoSelector.jsx
PaginationBar.jsx
MetricCard.jsx
DataTable.jsx
SkeletonTable.jsx
LoadingOverlay.jsx
ExportButton.jsx
CacheIndicator.jsx
```

### Paginas fuente

```txt
GlobalPage.jsx
CafPage.jsx
EmpresaPage.jsx
DevicePage.jsx
DocumentosPage.jsx
```

### SQL y funciones de folios

```txt
FUNCIONES_C2C_SOPORTE/gestionFolios/
FUNCIONES_C2C_SOPORTE/gestion_folios_base_/
FUNCIONES_C2C_SOPORTE/funciones_clasificacion/
FUNCIONES_C2C_SOPORTE/funciones_subprocesos/
FUNCIONES_C2C_SOPORTE/funciones_utiles/
FUNCIONES_C2C_SOPORTE/main_controladores/
FUNCIONES_C2C_SOPORTE/definiciones_estructura/
```

## Criterio de rescate

Se rescata la formula, contrato y modelo mental. No se rescata ejecucion directa.

Motivo:

- Los scripts historicos escriben en tablas de resultados.
- Algunos crean/alteran objetos.
- Algunos usan `public` directamente.
- Algunos contienen `DROP`, `ALTER`, `GRANT`, `INSERT`, `UPDATE` o indices.

## Pendientes normalizados

```txt
documentos_sin_caf_resumen
folios_rangos_clasificados_detalle
folios_resumen_empresa_extendido
folios_resumen_device_extendido
torre_control_empresa_resumen
tipodte_catalogo
folios_proceso_log
folios_validacion_log
```

## Regla de uso

Antes de portar cualquier pieza:

1. Leer `docs/20-normalizacion-querys-layoutExample.md`.
2. Verificar que la pieza no ejecute escrituras.
3. Adaptar origen a `staging_public` o `rr_gestion_soporte`.
4. Crear primero vista local o tabla local controlada.
5. Agregar script de verificacion.
6. Recién despues exponer backend/frontend.


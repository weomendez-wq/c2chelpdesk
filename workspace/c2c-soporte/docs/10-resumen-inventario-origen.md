# Resumen inventario origen

## Fecha de inventario

2026-05-15

## Fuente

Inventario local generado en:

```txt
database/inventory/source/20260515-025144/
```

Los CSV no se versionan.

## Resumen

- Tablas base detectadas en `public`: 40.
- Vistas detectadas: 0.
- `documentos` tiene aproximadamente 38.4 millones de filas y 67 GB.
- `enviosiidocs` tiene aproximadamente 40.1 millones de filas y 9.5 GB.
- `cierrecaja_documento` tiene aproximadamente 38 millones de filas y 10 GB.
- `contabilizaciondocs` tiene aproximadamente 6.3 millones de filas y 2.8 GB.
- `sincronizacionsap` tiene aproximadamente 193 mil filas y 35 MB.

## Hallazgos sobre documentos

Columnas candidatas de fecha:

- `fechaemision`: `character varying`
- `fechahora`: `character varying`

Esto obliga a validar formato antes de copiar por rango de fechas. Aunque existen indices relacionados con `fechaemision`, no se debe asumir que una condicion con casteo usara indice.

## Decision operativa

- No copiar `documentos` completo.
- No copiar tablas grandes sin plan especifico.
- Primero clasificar tablas candidatas a copia completa.
- Luego preparar scripts de copia solo para tablas pequenas.
- Para `documentos`, ejecutar `EXPLAIN (FORMAT JSON)` sobre la ventana enero-fecha usando la columna validada.

## Siguiente accion

Usar:

```powershell
.\database\scripts\build-copy-candidates.ps1 `
  -InventoryDir ".\database\inventory\source\20260515-023615"
```

Esto genera CSV locales ignorados por Git en:

```txt
database/inventory/source/20260515-023615/copy-candidates/
```

## Clasificacion generada

Resultado de `build-copy-candidates.ps1`:

- Candidatas a copia completa: 35.
- Tablas grandes para revision: 1.
- Tablas limitadas o especiales: 5.
- Relaciones no tabla base: 1.
- Tablas con estimacion desconocida: 0.

## Candidatas iniciales a copia completa

- `acteco`
- `caf`
- `cierrecaja`
- `cierrecaja_rango`
- `clasificacion_folios`
- `cognito_users`
- `complementoventas`
- `complementoventasdocs`
- `complementoventasresumen`
- `complementoventasresumentest`
- `contabilizacion`
- `device`
- `deviceconfiggroup`
- `deviceposconfig`
- `deviceregistrationkey`
- `deviceservices`
- `documento_estado_sii`
- `duplicados`
- `empresa`
- `enviorcof`
- `foliosdisponibles`
- `foliosdispservice`
- `historial_folios_rangos`
- `historialasignacionfolios`
- `internalids`
- `permissions`
- `posconfig`
- `posuser`
- `receptores`
- `roles`
- `tenant`
- `tenant_acteco`
- `tenant_permissions`
- `tmpfolios`
- `user_permissions`

## Requieren estrategia especial

- `documentos`
- `enviosiidocs`
- `cierrecaja_documento`
- `documentos_fecha_normalizada`
- `contabilizaciondocs`
- `sincronizacionsap`

## Riesgo pendiente

`sincronizacionsap` queda fuera de copia completa automatica por superar 100 mil filas. Puede copiarse despues de revisar si su volumen completo es aceptable o si requiere filtro.

## EXPLAIN documentos

Filtro directo sobre `public.documentos.fechaemision` para ventana 2026:

- Plan: `Seq Scan`.
- Filas estimadas: ~3.8 millones.
- Decision: no usar esta consulta como base de copia directa.

Filtro sobre `public.documentos_fecha_normalizada.fecha` para ventana 2026:

- Plan: `Index Only Scan`.
- Indice: `idx_doc_norm_tenant_rut_fecha`.
- Filas estimadas: ~1.86 millones.
- Decision: usar como apoyo analitico de fecha, pero no como reemplazo de `documentos` porque solo contiene `tenant_id`, `rut` y `fecha`.

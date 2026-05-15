# Resumen inventario origen

## Fecha de inventario

2026-05-15

## Fuente

Inventario local generado en:

```txt
database/inventory/source/20260515-023615/
```

Los CSV no se versionan.

## Resumen

- Tablas base detectadas en `public`: 40.
- Vistas detectadas: 0.
- `documentos` tiene aproximadamente 38 millones de filas y 67 GB.
- `enviosiidocs` tiene aproximadamente 39 millones de filas y 9.5 GB.
- `cierrecaja_documento` tiene aproximadamente 37 millones de filas y 10 GB.
- `contabilizaciondocs` tiene aproximadamente 6.2 millones de filas y 2.8 GB.

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

- Candidatas a copia completa: 11.
- Tablas grandes para revision: 1.
- Tablas limitadas o especiales: 5.
- Relaciones no tabla base: 1.
- Tablas con estimacion desconocida: 24.

## Candidatas iniciales a copia completa

- `acteco`
- `caf`
- `cierrecaja`
- `cierrecaja_rango`
- `device`
- `deviceconfiggroup`
- `empresa`
- `foliosdisponibles`
- `foliosdispservice`
- `historialasignacionfolios`
- `receptores`

## Requieren estrategia especial

- `documentos`
- `enviosiidocs`
- `cierrecaja_documento`
- `documentos_fecha_normalizada`
- `contabilizaciondocs`
- `sincronizacionsap`

## Riesgo pendiente

Las tablas con `estimated_rows = -1` requieren conteo controlado o `ANALYZE` en origen, pero no se debe ejecutar mantenimiento sobre origen. La opcion segura es generar `SELECT count(*)` solo para tablas pequenas por tamaño fisico y revisar tiempos.

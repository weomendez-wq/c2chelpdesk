# Bitacora - Plan bloque 2 tablas especiales

## Fecha

2026-05-15

## Objetivo

Analizar las tablas excluidas del bloque 1 y definir un orden seguro para el bloque 2.

## Tablas revisadas

- `sincronizacionsap`
- `mv_device_operacion`
- `contabilizaciondocs`
- `documentos_fecha_normalizada`
- `documentos`
- `enviosiidocs`
- `cierrecaja_documento`

## Evidencia

Se ejecuto `EXPLAIN (FORMAT JSON)` en origen con sesion read-only.

Archivo versionado para repetir la revision:

```txt
database/sql/source-readonly/30-block2-explain-candidates.sql
```

## Decisiones

- `sincronizacionsap` y `mv_device_operacion` quedan como candidatas a bloque 2A.
- `contabilizaciondocs` puede copiarse por ventana 2026 usando indice sobre `fechaemision`.
- `documentos_fecha_normalizada` puede copiarse por ventana 2026 usando indice de fecha.
- `documentos` solo debe copiarse con filtro funcional que use `idx_documentos_fechaemision_v2`.
- `enviosiidocs` no se aprueba con join directo porque escanea 40106000 filas.
- `cierrecaja_documento` no se aprueba con join completo porque estima 9532545 filas y recorrido grande.

## Siguiente paso

Generar bloque 2A como copia acotada para `sincronizacionsap` y `mv_device_operacion`, manteniendo export/import CSV y validacion de conteos.

## Avance posterior

Se agrega `database/scripts/generate-copy-block2a.ps1` para preparar artefactos locales de copia. El script no ejecuta copia automaticamente.

## Resultado bloque 2A

Artefactos locales:

```txt
database/generated/copy-block2a/20260515-031521
```

Resultado validado:

- `sincronizacionsap`: 192903 filas origen y local.
- `mv_device_operacion`: 384 filas origen y local.
- Total origen: 193287.
- Total local: 193287.
- Diferencias: 0.

Los CSV y archivos de comparacion quedan ignorados por Git en `database/generated/`.

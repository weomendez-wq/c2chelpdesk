# Bitacora - Resumen inventario origen

## Fecha

2026-05-15

## Objetivo

Analizar el inventario exportado desde origen y preparar el siguiente paso de clasificacion de copia.

## Hallazgos

- Se detectaron 40 tablas base en `public`.
- `documentos`, `enviosiidocs`, `cierrecaja_documento` y `contabilizaciondocs` son tablas grandes y requieren plan especifico.
- `documentos` tiene columnas candidatas de fecha como texto: `fechaemision` y `fechahora`.
- Existen indices relacionados con `fechaemision`, pero se debe validar el plan con `EXPLAIN`.

## Cambios

- Crear resumen de inventario.
- Crear script `build-copy-candidates.ps1` para generar candidatos de copia completa y tablas que requieren revision.

## Clasificacion generada

- Candidatas a copia completa: 11.
- Tablas grandes para revision: 1.
- Tablas limitadas o especiales: 5.
- Relaciones no tabla base: 1.
- Tablas con estimacion desconocida: 24.

## Seguridad

Los CSV generados por el script quedan dentro de `database/inventory/source/...` y no se versionan.

## Siguiente recomendacion

Crear un script de conteo controlado para tablas candidatas y tablas desconocidas pequenas, excluyendo tablas grandes y especiales.

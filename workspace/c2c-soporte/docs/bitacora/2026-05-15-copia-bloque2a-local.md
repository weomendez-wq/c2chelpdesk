# Bitacora - Copia local bloque 2A

## Fecha

2026-05-15

## Objetivo

Ejecutar localmente la copia controlada del bloque 2A desde `dte.public` hacia `soporte.staging_public`.

## Alcance

- `sincronizacionsap`
- `mv_device_operacion`

## Criterio

Estas relaciones fueron seleccionadas porque el `EXPLAIN` previo mostro volumen acotado frente al resto de tablas especiales.

## Artefactos locales

```txt
database/generated/copy-block2a/20260515-031521
```

Archivos principales:

- `01-create-staging-tables.sql`
- `02-export-source-csv.ps1`
- `03-import-local-csv.ps1`
- `04-verify-staging-counts.sql`
- `05-source-counts.sql`
- `06-local-counts.sql`
- `count-comparison.csv`

Estos archivos no se versionan.

## Resultado

- Relaciones copiadas: 2.
- Filas origen: 193287.
- Filas locales: 193287.
- Diferencias por conteo: 0.

## Siguiente paso

Preparar bloque 2B para `contabilizaciondocs` por ventana 2026, usando el indice confirmado por `EXPLAIN`.

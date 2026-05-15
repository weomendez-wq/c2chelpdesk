# Bitacora - Copia local bloque 1

## Fecha

2026-05-15

## Objetivo

Ejecutar localmente la copia controlada del bloque 1 desde `dte.public` hacia `soporte.staging_public`.

## Alcance

- Solo tablas clasificadas como `copy_full_candidate`.
- No incluye tablas grandes ni especiales.
- Export desde origen con sesion read-only.
- Import hacia PostgreSQL local `localhost:5434`, base `soporte`.

## Artefactos locales

Directorio generado:

```txt
database/generated/copy-block1/20260515-030016
```

Archivos principales:

- `01-create-staging-tables.sql`
- `02-export-source-csv.ps1`
- `03-import-local-csv.ps1`
- `04-verify-staging-counts.sql`
- `tables-manifest.csv`
- `source-counts.csv`
- `local-counts.csv`
- `count-comparison.csv`

Estos archivos no se versionan.

## Resultado

- Tablas copiadas: 35.
- Filas origen: 229211.
- Filas locales: 229211.
- Diferencias por conteo: 0.

## Observaciones

El conteo por lineas de CSV no se usa como validacion porque algunos campos pueden contener saltos de linea internos. La validacion correcta fue `COUNT(*)` por tabla en origen y local.

## Siguiente paso

Preparar bloque 2 con estrategia especifica para tablas de mayor volumen o uso especial antes de ejecutar cualquier copia adicional.

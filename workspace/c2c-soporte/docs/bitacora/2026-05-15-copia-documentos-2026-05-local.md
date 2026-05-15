# Bitacora - Copia local documentos mayo 2026

## Fecha

2026-05-15

## Objetivo

Ejecutar localmente la copia controlada de `documentos` para mayo 2026.

## Alcance

Origen:

```txt
public.documentos
```

Destino:

```txt
staging_public.documentos_2026_05
```

Filtro:

```sql
WHERE rr_gestion_soporte.fn_parse_dte_timestamp(fechaemision) >= timestamp '2026-05-01'
  AND rr_gestion_soporte.fn_parse_dte_timestamp(fechaemision) < timestamp '2026-06-01'
```

## Criterio

Se usa filtro funcional porque el `EXPLAIN` confirmo `Index Scan` sobre `idx_documentos_fechaemision_v2`.

El destino usa sufijo de ventana porque no representa una copia completa de `documentos`.

## Artefactos locales

```txt
database/generated/copy-documentos-2026-05/20260515-033145
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

- Relaciones copiadas: 1.
- Filas origen: 402918.
- Filas locales: 402918.
- Diferencias por conteo: 0.

## Observacion

El conteo mensual previo fue 402915. La diferencia de 3 filas se atribuye a cambios en origen entre mediciones; la validacion final origen/local quedo consistente.

## Siguiente paso

Evaluar utilidad del lote mayo para consultas de soporte y decidir si se importan meses anteriores con el mismo patron.

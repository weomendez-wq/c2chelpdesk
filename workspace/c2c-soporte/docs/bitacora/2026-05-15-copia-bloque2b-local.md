# Bitacora - Copia local bloque 2B

## Fecha

2026-05-15

## Objetivo

Ejecutar localmente la copia controlada de `contabilizaciondocs` para la ventana 2026.

## Alcance

Origen:

```txt
public.contabilizaciondocs
```

Destino:

```txt
staging_public.contabilizaciondocs_2026
```

Filtro:

```sql
WHERE fechaemision >= '2026-01-01'
  AND fechaemision < '2027-01-01'
```

## Criterio

El destino usa sufijo `_2026` porque no representa una copia completa de la tabla origen.

El `EXPLAIN` previo uso indice y estimo 448666 filas. El conteo real de la ventana fue 459437 filas.

## Artefactos locales

```txt
database/generated/copy-block2b/20260515-031932
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
- Filas origen: 459437.
- Filas locales: 459437.
- Diferencias por conteo: 0.

## Siguiente paso

Preparar estrategia para `documentos` por ventana 2026 usando indice funcional.

## Acotacion posterior

Se decide diferir `documentos_fecha_normalizada`.

Motivo:

- Es una normalizacion derivada de `documentos`.
- Aun no sabemos que subconjunto real de `documentos` importaremos.
- Evita agregar volumen que podria no ser necesario.
- Se reevaluara despues de importar o definir el subconjunto de `documentos`.

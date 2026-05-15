# Bitacora - Plan documentos

## Fecha

2026-05-15

## Objetivo

Definir una estrategia de importacion controlada para `public.documentos`.

## Hallazgos

- `documentos` tiene estimacion total de 38482288 filas y 67 GB.
- Filtro directo por `fechaemision` produjo `Seq Scan`; no aprobado.
- Filtro funcional por `rr_gestion_soporte.fn_parse_dte_timestamp(fechaemision)` usa indice funcional `idx_documentos_fechaemision_v2`.
- Conteo mensual 2026 en origen:
  - 2026-01: 888389
  - 2026-02: 857721
  - 2026-03: 912756
  - 2026-04: 857704
  - 2026-05: 402915

## Decision

No copiar todo 2026 de una vez.

Primer lote propuesto:

```txt
staging_public.documentos_2026_05
```

## Siguiente paso

Ejecutar `EXPLAIN` de mayo 2026 con `database/sql/source-readonly/31-documentos-window-explain.sql` y, si sigue usando indice funcional, generar copia del lote mayo.

## EXPLAIN mayo 2026

Resultado:

- Filtro funcional: `Index Scan` usando `idx_documentos_fechaemision_v2`, 385599 filas estimadas.
- Filtro directo mensual: `Index Scan` usando `idx_doc_fecha`, 152837 filas estimadas.

Decision:

- Usar filtro funcional para la copia por coherencia con la normalizacion de fechas y porque el filtro anual directo ya habia producido `Seq Scan`.

## Avance posterior

Se agrega `database/scripts/generate-copy-documentos-2026-05.ps1` para preparar artefactos locales del lote mayo 2026. El script no ejecuta copia automaticamente.

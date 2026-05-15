# Bitacora - Vista documentos 2026

## Fecha

2026-05-15

## Objetivo

Crear una vista local para consultar las ventanas importadas de `documentos` 2026 como un solo conjunto.

## Objeto

```txt
rr_gestion_soporte.documentos_2026
```

## Fuente

- `staging_public.documentos_2026_01`
- `staging_public.documentos_2026_02`
- `staging_public.documentos_2026_03`
- `staging_public.documentos_2026_04`
- `staging_public.documentos_2026_05`

## Criterio

La vista usa `UNION ALL` y agrega `periodo`.

No se crea una tabla local llamada `documentos` porque el staging disponible corresponde solo a ventanas 2026, no a la tabla completa de origen.

## Scripts

- `database/sql/20-create-documentos-2026-view.sql`
- `database/sql/21-verify-documentos-2026-view.sql`

## Resultado

Vista creada localmente.

Conteos validados:

| Periodo | Filas |
| --- | ---: |
| 2026-01 | 888389 |
| 2026-02 | 857721 |
| 2026-03 | 912756 |
| 2026-04 | 857704 |
| 2026-05 | 402918 |
| Total | 3919488 |

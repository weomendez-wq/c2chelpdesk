# Plan documentos

## Objetivo

Definir una estrategia segura para importar un subconjunto de `public.documentos` hacia local sin copiar la tabla completa.

## Estado

`public.documentos` es la tabla mas grande revisada:

- Estimacion total: 38482288 filas.
- Tamano total: 67 GB.
- Columnas: 21.

El filtro directo por `fechaemision` no esta aprobado porque produjo `Seq Scan`.

El filtro funcional por `rr_gestion_soporte.fn_parse_dte_timestamp(fechaemision)` usa el indice `idx_documentos_fechaemision_v2`.

## Distribucion 2026

Consulta ejecutada en origen con sesion read-only el 2026-05-15.

| Mes | Filas |
| --- | ---: |
| 2026-01 | 888389 |
| 2026-02 | 857721 |
| 2026-03 | 912756 |
| 2026-04 | 857704 |
| 2026-05 | 402915 |
| Total | 3919485 |

## Decision

No copiar todo 2026 en una sola operacion.

Primer lote recomendado:

```txt
staging_public.documentos_2026_05
```

Filtro:

```sql
WHERE rr_gestion_soporte.fn_parse_dte_timestamp(fechaemision) >= timestamp '2026-05-01'
  AND rr_gestion_soporte.fn_parse_dte_timestamp(fechaemision) < timestamp '2026-06-01'
```

Motivo:

- Mayo 2026 es el lote menor disponible con 402915 filas.
- Permite medir tiempo, tamano local y utilidad funcional antes de importar meses mayores.
- Mantiene una tabla staging con nombre explicito de ventana.

## Orden propuesto

1. Ejecutar `EXPLAIN` de mayo 2026 usando `database/sql/source-readonly/31-documentos-window-explain.sql`.
2. Generar scripts de copia para `staging_public.documentos_2026_05`.
3. Exportar CSV desde origen en modo read-only.
4. Importar en local.
5. Validar conteos origen/local.
6. Evaluar si se requiere reconstruir o copiar `documentos_fecha_normalizada`.

## Generador

```powershell
.\database\scripts\generate-copy-documentos-2026-05.ps1 `
  -InventoryDir ".\database\inventory\source\20260515-025144"
```

Para los meses restantes se usa generador parametrizable:

```powershell
.\database\scripts\generate-copy-documentos-window.ps1 `
  -InventoryDir ".\database\inventory\source\20260515-025144" `
  -StartDate "2026-04-01" `
  -EndDate "2026-05-01" `
  -TargetTable "documentos_2026_04"
```

## Ejecucion mayo 2026

Ejecucion local completada el 2026-05-15 con artefactos en `database/generated/copy-documentos-2026-05/20260515-033145`.

Resultado:

- Relaciones copiadas: 1.
- Filas origen: 402918.
- Filas locales: 402918.
- Diferencias por conteo: 0.

El conteo mensual previo habia mostrado 402915 filas. La diferencia de 3 filas se explica por cambio en origen entre consultas; la validacion final compara origen/local despues de la exportacion y quedo en 0 diferencias.

## Meses requeridos

Se confirma que tambien se necesitan los meses anteriores de 2026.

Orden de importacion:

1. `documentos_2026_04`
2. `documentos_2026_03`
3. `documentos_2026_02`
4. `documentos_2026_01`

Cada mes debe mantener tabla staging independiente y validacion origen/local.

## Regla

No crear una tabla local llamada `documentos` hasta definir si sera copia completa, vista consolidada o union de ventanas.

## EXPLAIN mayo 2026

Ejecutado el 2026-05-15 con sesion read-only.

Filtro funcional:

- Nodo: `Index Scan`.
- Indice: `idx_documentos_fechaemision_v2`.
- Filas estimadas: 385599.
- Filtro aprobado.

Filtro directo por `fechaemision` para mayo:

- Nodo: `Index Scan`.
- Indice: `idx_doc_fecha`.
- Filas estimadas: 152837.

Aunque el filtro directo mensual usa indice, se mantiene como preferente el filtro funcional porque:

- El filtro anual directo ya produjo `Seq Scan`.
- El filtro funcional normaliza la fecha antes de comparar.
- Mantiene coherencia con la estrategia definida para ventanas de `documentos`.

# Decision - Diferir documentos_fecha_normalizada

## Fecha

2026-05-15

## Contexto

`documentos_fecha_normalizada` es una materialized view derivada de `documentos`.

El plan inicial la consideraba para copia por ventana 2026 porque el `EXPLAIN` mostraba uso de indice y una estimacion cercana a 1868423 filas.

## Decision

No copiar `documentos_fecha_normalizada` en este momento.

## Motivo

- Es informacion derivada, no fuente principal.
- Puede agregar volumen antes de definir el subconjunto real de `documentos`.
- Si `documentos` se importa por ventana, empresa, dispositivo u otro criterio, esta normalizacion podria reconstruirse localmente desde ese subconjunto.
- Evita cargar datos que podrian no aportar al analisis inicial.

## Consecuencia

El siguiente paso pasa a ser la estrategia de importacion de `documentos`.

Luego se reevaluara si `documentos_fecha_normalizada` debe:

1. Omitirse.
2. Copiarse filtrada.
3. Reconstruirse localmente desde tablas staging.

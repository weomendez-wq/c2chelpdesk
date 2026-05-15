# Bitacora - Inspeccion local

## Fecha

2026-05-15

## Objetivo

Agregar scripts de inspeccion de estructura para la base local `soporte`, sin copiar datos ni ejecutar conteos pesados.

## Cambios

- Crear `10-inspect-schemas.sql`.
- Crear `11-inspect-tables-columns.sql`.
- Crear `12-inspect-indexes.sql`.
- Crear `13-inspect-table-estimates.sql`.
- Actualizar documentacion de database y SQL.

## Seguridad

Todos los scripts son de solo lectura. El script de estimaciones usa `pg_class.reltuples` y `pg_total_relation_size`, no `COUNT(*)`.

## Validacion ejecutada

Se ejecutaron consultas equivalentes desde Node con `pg` contra `postgres://postgres:postgres@localhost:5434/soporte`.

Resultado:

- Schemas encontrados: `rr_gestion_soporte`, `staging_public`.
- Tablas/columnas: sin resultados.
- Indices: sin resultados.
- Estimaciones de tablas/views/materialized views: sin resultados.

Esto es coherente con el estado actual: existen los schemas, pero todavia no hay tablas locales ni datos copiados.

## Pendientes

- Ejecutar scripts de inspeccion cuando existan tablas locales copiadas o creadas.
- Guardar resultados relevantes en bitacora si aparecen objetos nuevos.

# SQL

## Regla productiva

El esquema `public` productivo se considera solo lectura.

## Comandos prohibidos sobre public productivo

- `INSERT`
- `UPDATE`
- `DELETE`
- `TRUNCATE`
- `DROP`
- `ALTER`
- `CREATE`
- `GRANT`
- `REVOKE`

## Flujo para queries pesadas

1. Ejecutar `EXPLAIN (FORMAT JSON)`.
2. Revisar costo, filas estimadas, indices, Seq Scan y joins.
3. Solo si el plan es seguro, ejecutar `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)`.

## Entorno local objetivo

- Base local: `soporte`.
- Esquema de copia controlada: `staging_public`.
- Esquema de objetos propios: `rr_gestion_soporte`.


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

## Scripts locales

Los scripts iniciales estan en `database/sql/`:

- `00-create-database.sql`: crea la base local `soporte` si no existe.
- `01-create-schemas.sql`: crea `staging_public` y `rr_gestion_soporte` si no existen.
- `99-verify-local.sql`: valida base actual y schemas esperados.
- `10-inspect-schemas.sql`: lista schemas locales esperados.
- `11-inspect-tables-columns.sql`: lista tablas y columnas.
- `12-inspect-indexes.sql`: lista indices.
- `13-inspect-table-estimates.sql`: lista estimaciones de filas y tamanos sin `COUNT(*)`.

Estos scripts no deben ejecutarse contra produccion.

## Inventario de origen public

Los scripts `database/sql/source-readonly/` permiten inspeccionar el origen `public` con consultas de solo lectura antes de copiar datos.

Reglas:

- No modifican `public`.
- No ejecutan `COUNT(*)`.
- No copian datos.
- `25-documentos-window-explain-template.sql` es una plantilla y requiere reemplazar `<columna_fecha>`.

Los resultados de inventario exportados por `database/scripts/export-source-inventory.ps1` quedan en `database/inventory/source/` y no se versionan.

## Endpoint inicial de analisis

```txt
POST /api/admin/sql/explain
```

## Alcance del endpoint

- Ejecutar solo `EXPLAIN (FORMAT JSON)` sobre consultas de lectura.
- Aceptar consultas que comiencen con `SELECT` o `WITH`.
- Bloquear multiples sentencias.
- Bloquear comentarios SQL en esta primera version.
- Bloquear comandos peligrosos aunque aparezcan dentro de la consulta.
- Devolver el plan JSON y una deteccion inicial de `Seq Scan`.

## Comandos bloqueados por el validador

- `INSERT`
- `UPDATE`
- `DELETE`
- `TRUNCATE`
- `DROP`
- `ALTER`
- `CREATE`
- `GRANT`
- `REVOKE`
- `COPY`
- `CALL`
- `DO`
- `EXECUTE`

## Restricciones de primera version

- No ejecuta `EXPLAIN ANALYZE`.
- No acepta parametros dinamicos.
- No reemplaza revision humana para queries pesadas.
- No debe exponerse publicamente sin autenticacion y autorizacion.

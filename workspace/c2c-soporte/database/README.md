# Database C2C Soporte

## Objetivo

Centralizar scripts SQL locales del proyecto C2C Soporte / DTE / Torre de Control.

## Regla principal

Estos scripts son para entorno local. No se deben ejecutar contra una base productiva sin revision explicita.

## Base local objetivo

```txt
soporte
```

## Conexion local confirmada

```txt
host: localhost
port: 5434
user: postgres
database: soporte
```

## Schemas locales objetivo

- `staging_public`: copia controlada, snapshots y staging local.
- `rr_gestion_soporte`: views, materialized views, metricas, helpers, control y logging.

## Orden recomendado

1. Conectarse a la base administrativa `postgres`.
2. Ejecutar `sql/00-create-database.sql`.
3. Conectarse a la base local `soporte`.
4. Ejecutar `sql/01-create-schemas.sql`.
5. Validar con `sql/99-verify-local.sql`.

## Scripts de inspeccion

Estos scripts son de solo lectura:

- `sql/10-inspect-schemas.sql`: lista schemas locales esperados.
- `sql/11-inspect-tables-columns.sql`: lista tablas y columnas.
- `sql/12-inspect-indexes.sql`: lista indices.
- `sql/13-inspect-table-estimates.sql`: lista estimaciones de filas y tamanos sin usar `COUNT(*)`.

## Scripts de inventario de origen

La carpeta `sql/source-readonly/` contiene consultas de solo lectura para inspeccionar el esquema `public` origen antes de definir copias:

- `20-public-table-inventory.sql`
- `21-public-columns-inventory.sql`
- `22-public-indexes-inventory.sql`
- `23-public-table-estimates.sql`
- `24-documentos-date-candidates.sql`
- `25-documentos-window-explain-template.sql`

No modifican datos ni estructura. La plantilla de `documentos` requiere reemplazar `<columna_fecha>` antes de ejecutarse.

## Exportar inventario de origen

Desde `workspace/c2c-soporte`:

```powershell
.\database\scripts\export-source-inventory.ps1 `
  -HostName "<host_origen>" `
  -Port 5432 `
  -Database "<base_origen>" `
  -User "<usuario_solo_lectura>" `
  -ReadOnlySession
```

Los CSV quedan en `database/inventory/source/` y no se versionan.

Si no existe usuario solo lectura, se permite usar `master` solo con `-ReadOnlySession` y password temporal en variable de entorno local.

## Comandos de referencia

```powershell
psql -h localhost -p 5434 -U postgres -d postgres -f .\database\sql\00-create-database.sql
psql -h localhost -p 5434 -U postgres -d soporte -f .\database\sql\01-create-schemas.sql
psql -h localhost -p 5434 -U postgres -d soporte -f .\database\sql\99-verify-local.sql
psql -h localhost -p 5434 -U postgres -d soporte -f .\database\sql\10-inspect-schemas.sql
psql -h localhost -p 5434 -U postgres -d soporte -f .\database\sql\11-inspect-tables-columns.sql
psql -h localhost -p 5434 -U postgres -d soporte -f .\database\sql\12-inspect-indexes.sql
psql -h localhost -p 5434 -U postgres -d soporte -f .\database\sql\13-inspect-table-estimates.sql
```

## Estado

Scripts ejecutados localmente por Rodrigo. Conexion validada desde backend con `pg` y endpoint `POST /api/admin/sql/explain`.

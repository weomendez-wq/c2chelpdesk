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

## Objetos locales de soporte

- `sql/20-create-documentos-2026-view.sql`: crea `rr_gestion_soporte.documentos_2026` como union de ventanas staging.
- `sql/21-verify-documentos-2026-view.sql`: verifica conteos por periodo y total de la vista.
- `sql/22-create-base-support-views.sql`: crea vistas base de empresa y dispositivos.
- `sql/23-verify-base-support-views.sql`: verifica conteos de vistas base.
- `sql/24-create-empresa-control-resumen.sql`: crea vista de control por empresa.
- `sql/25-verify-empresa-control-resumen.sql`: verifica control por empresa.
- `sql/26-create-documentos-operational-views.sql`: crea vistas documentales operativas de lectura.
- `sql/27-verify-documentos-operational-views.sql`: verifica vistas documentales operativas.
- `sql/28-create-device-operational-views.sql`: crea vista operacional por device.
- `sql/29-verify-device-operational-views.sql`: verifica vista operacional por device.

## Scripts de inventario de origen

La carpeta `sql/source-readonly/` contiene consultas de solo lectura para inspeccionar el esquema `public` origen antes de definir copias:

- `20-public-table-inventory.sql`
- `21-public-columns-inventory.sql`
- `22-public-indexes-inventory.sql`
- `23-public-table-estimates.sql`
- `24-documentos-date-candidates.sql`
- `25-documentos-window-explain-template.sql`
- `30-block2-explain-candidates.sql`
- `31-documentos-window-explain.sql`

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

## Generar bloque 1 de copia

```powershell
.\database\scripts\generate-copy-block1.ps1 `
  -InventoryDir ".\database\inventory\source\YYYYMMDD-HHMMSS"
```

Los scripts generados quedan en `database/generated/copy-block1/` y no se versionan.

## Generar bloque 2A de copia

```powershell
.\database\scripts\generate-copy-block2a.ps1
```

Los scripts generados quedan en `database/generated/copy-block2a/` y no se versionan.

## Generar bloque 2B de copia

```powershell
.\database\scripts\generate-copy-block2b.ps1 `
  -InventoryDir ".\database\inventory\source\YYYYMMDD-HHMMSS"
```

El bloque 2B crea `staging_public.contabilizaciondocs_2026` como tabla de ventana, no como copia completa de `contabilizaciondocs`.

Los scripts generados quedan en `database/generated/copy-block2b/` y no se versionan.

## Generar documentos mayo 2026

```powershell
.\database\scripts\generate-copy-documentos-2026-05.ps1 `
  -InventoryDir ".\database\inventory\source\YYYYMMDD-HHMMSS"
```

El destino local es `staging_public.documentos_2026_05`.

Los scripts generados quedan en `database/generated/copy-documentos-2026-05/` y no se versionan.

## Generar ventana documentos

```powershell
.\database\scripts\generate-copy-documentos-window.ps1 `
  -InventoryDir ".\database\inventory\source\YYYYMMDD-HHMMSS" `
  -StartDate "2026-04-01" `
  -EndDate "2026-05-01" `
  -TargetTable "documentos_2026_04"
```

Los scripts generados quedan en `database/generated/copy-documentos-window/` y no se versionan.

## Copia local documentos mayo 2026

El lote mayo 2026 fue ejecutado localmente desde origen `dte.public` hacia `soporte.staging_public`.

Resultado validado:

- 1 relacion copiada.
- 402918 filas en origen.
- 402918 filas en local.
- 0 diferencias por conteo.

## Copia local documentos enero-abril 2026

Los lotes enero, febrero, marzo y abril 2026 fueron ejecutados localmente desde origen `dte.public` hacia `soporte.staging_public`.

Resultado validado:

- 4 relaciones copiadas.
- 3516570 filas en origen.
- 3516570 filas en local.
- 0 diferencias por conteo.

## Copia local bloque 2B

El bloque 2B fue ejecutado localmente desde origen `dte.public` hacia `soporte.staging_public`.

Resultado validado:

- 1 relacion copiada.
- 459437 filas en origen.
- 459437 filas en local.
- 0 diferencias por conteo.

## Copia local bloque 2A

El bloque 2A fue ejecutado localmente desde origen `dte.public` hacia `soporte.staging_public`.

Resultado validado:

- 2 relaciones copiadas.
- 193287 filas en origen.
- 193287 filas en local.
- 0 diferencias por conteo.

## Copia local bloque 1

El bloque 1 fue ejecutado localmente desde origen `dte.public` hacia `soporte.staging_public`.

Resultado validado:

- 35 tablas copiadas.
- 229211 filas en origen.
- 229211 filas en local.
- 0 diferencias por conteo.

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

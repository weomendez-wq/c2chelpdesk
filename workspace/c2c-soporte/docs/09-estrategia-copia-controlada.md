# Estrategia de copia controlada

## Objetivo

Preparar la copia desde origen `public` hacia entorno local `staging_public` sin modificar la base productiva y sin copiar `documentos` completo.

## Principios

- `public` productivo es solo lectura.
- Primero se inventaria estructura, indices y estimaciones.
- No se ejecuta copia hasta revisar volumen y columnas.
- `documentos` requiere tratamiento especial.
- Todo script de copia debe ejecutarse contra destino local, no contra produccion.

## Fase 1 - Inventario de origen

Ejecutar solo consultas de lectura:

- `database/sql/source-readonly/20-public-table-inventory.sql`
- `database/sql/source-readonly/21-public-columns-inventory.sql`
- `database/sql/source-readonly/22-public-indexes-inventory.sql`
- `database/sql/source-readonly/23-public-table-estimates.sql`
- `database/sql/source-readonly/24-documentos-date-candidates.sql`

Opcionalmente usar el runner:

```powershell
.\database\scripts\export-source-inventory.ps1 `
  -HostName "<host_origen>" `
  -Port 5432 `
  -Database "<base_origen>" `
  -User "<usuario_solo_lectura>" `
  -ReadOnlySession
```

Los resultados se guardan como CSV locales ignorados por Git en `database/inventory/source/`.

Si no existe usuario solo lectura, se puede usar `master` solo con `-ReadOnlySession`, que fuerza la sesion a solo lectura y agrega timeouts.

## Fase 2 - Decision de copia

Con el inventario se clasifican tablas:

- Tablas pequenas: candidatas a copia completa.
- Tablas medianas/grandes: requieren revision por volumen e indices.
- `documentos`: copiar solo desde enero del año actual hasta la fecha.

## Fase 3 - EXPLAIN antes de copiar documentos

Antes de copiar `documentos`, definir la columna de fecha y ejecutar:

```txt
database/sql/source-readonly/25-documentos-window-explain-template.sql
```

El placeholder `<columna_fecha>` debe reemplazarse por la columna validada.

## Criterios de seguridad

- No usar `SELECT *` para copia final si la tabla tiene columnas sensibles que deban excluirse.
- No ejecutar `EXPLAIN ANALYZE` sobre origen sin revision previa.
- No crear indices ni objetos en `public`.
- No usar `COPY` directamente contra productivo sin plan revisado.

## Pendientes

- Obtener inventario real de origen.
- Identificar columna de fecha correcta en `public.documentos`.
- Definir scripts de copia hacia `staging_public`.

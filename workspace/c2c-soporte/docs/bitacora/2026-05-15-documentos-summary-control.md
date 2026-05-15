# Bitacora - Documentos summary control

## Fecha

2026-05-15

## Objetivo

Agregar resumen documental 2026 para el control operativo.

## Endpoint planificado

```txt
GET /api/support/control/documents-summary
```

## Filtros

- `tenantId`
- `rut`

## Consultas base

Total documentos del ano:

```sql
SELECT count(*) AS total_rows
FROM rr_gestion_soporte.documentos_2026;
```

Total mensual:

```sql
SELECT periodo, count(*) AS rows_count
FROM rr_gestion_soporte.documentos_2026
GROUP BY periodo
ORDER BY periodo;
```

Estas consultas deben soportar filtro por empresa cuando se seleccione una fila:

```sql
WHERE tenant_id = $1
  AND rut = $2
```

## Criterio

El endpoint se usa para cards compactas y visualizacion mensual. No reemplaza las vistas de control por empresa; las complementa.

## Validacion

Comandos ejecutados:

```txt
npm run typecheck
npm run build
GET /api/support/control/documents-summary
GET /api/support/control/companies?limit=1&offset=0&alert=URGENTE
```

Resultado:

```txt
backend typecheck: OK
backend build: OK
frontend typecheck: OK
frontend build: OK
documents-summary: 200 OK
control companies: 200 OK
```

Resumen global observado:

```txt
companies: 68
devices: 253
documents: 3.919.488
```

Nota:

- El build Vite requirio ejecucion fuera del sandbox por bloqueo `spawn EPERM` de `esbuild`.

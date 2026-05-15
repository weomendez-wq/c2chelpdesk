# Plan de copia controlada

## Objetivo

Definir el primer bloque de copia desde origen `public` hacia local `staging_public`, minimizando riesgo sobre tablas grandes.

## Bloque 1 - Copia completa candidata

Copiar primero las 35 tablas clasificadas como `copy_full_candidate`.

Reglas:

- Crear estructura en `staging_public`.
- Copiar datos completos solo para tablas candidatas.
- No copiar tablas especiales ni grandes.
- Validar conteos locales despues de copiar.

## Excluidas del bloque 1

- `documentos`
- `enviosiidocs`
- `cierrecaja_documento`
- `documentos_fecha_normalizada`
- `contabilizaciondocs`
- `sincronizacionsap`
- `mv_device_operacion`

## Documentos

No copiar completo.

Hallazgo:

- `fechaemision` es `varchar`.
- Filtro 2026 directo por `fechaemision` produce `Seq Scan`.
- `documentos_fecha_normalizada.fecha` usa `Index Only Scan`, pero no contiene todo el detalle documental.

Decision:

- No copiar `documentos` hasta diseñar una estrategia con `EXPLAIN` aprobado.
- Usar `documentos_fecha_normalizada` solo como soporte analitico o filtro auxiliar.

## Generador creado

El script `database/scripts/generate-copy-block1.ps1` genera artefactos locales para:

1. Generar DDL local para crear tablas en `staging_public`.
2. Exportar CSV desde origen `dte.public` en sesion read-only.
3. Importar CSV hacia local `soporte.staging_public`.
4. Verificar conteos locales.

El generador debe leer `copy-full-candidates.csv`, que permanece ignorado por Git.

## Generador

```powershell
.\database\scripts\generate-copy-block1.ps1 `
  -InventoryDir ".\database\inventory\source\20260515-025144"
```

Los artefactos se crean en `database/generated/copy-block1/` y no se versionan.

## Siguiente paso tecnico

Bloque 1 ejecutado localmente el 2026-05-15 con artefactos generados en `database/generated/copy-block1/20260515-030016`.

Resultado:

- Tablas copiadas: 35.
- Filas origen: 229211.
- Filas locales: 229211.
- Diferencias por conteo: 0.

Los archivos de evidencia (`source-counts.csv`, `local-counts.csv`, `count-comparison.csv`) quedan en `database/generated/` y no se versionan.

## Siguiente paso tecnico

Disenar el bloque 2 para tablas de revision/especiales:

- `sincronizacionsap`
- `contabilizaciondocs`
- `documentos_fecha_normalizada`
- `cierrecaja_documento`
- `enviosiidocs`
- `documentos`
- `mv_device_operacion`

Para cada tabla especial se debe definir primero filtro, ventana, indice util, `EXPLAIN` esperado y limite operacional.

## Referencia de ejecucion

El flujo manual del bloque 1 fue:

1. Crear tablas locales con `01-create-staging-tables.sql`.
2. Exportar CSV desde origen con `02-export-source-csv.ps1`.
3. Importar CSV hacia local con `03-import-local-csv.ps1`.
4. Validar conteos con `04-verify-staging-counts.sql`.

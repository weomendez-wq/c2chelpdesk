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

## Siguiente paso tecnico

Crear script generador de SQL para:

1. Crear tablas en `staging_public` con `CREATE TABLE ... AS SELECT ... WITH NO DATA`.
2. Insertar datos para las 35 tablas candidatas.
3. Verificar conteos locales.

El generador debe leer `copy-full-candidates.csv`, que permanece ignorado por Git.


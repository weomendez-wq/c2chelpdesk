# Bitacora - Estrategia copia controlada

## Fecha

2026-05-15

## Objetivo

Preparar scripts de inventario de origen y documentar la estrategia de copia controlada antes de copiar datos.

## Cambios

- Crear scripts `source-readonly` para inventario de `public`.
- Crear script para detectar columnas candidatas de fecha en `public.documentos`.
- Crear plantilla `EXPLAIN` para ventana enero-fecha de `documentos`.
- Crear documento `09-estrategia-copia-controlada.md`.

## Seguridad

No se agregaron scripts de copia ni escrituras. Todos los scripts nuevos son de solo lectura o plantillas de `EXPLAIN`.

## Validacion local

Se ejecutaron consultas equivalentes contra la base local `soporte` para validar sintaxis.

Resultado en `public` local:

- Tablas/views: sin resultados.
- Columnas: sin resultados.
- Indices: sin resultados.
- Candidatas de fecha para `documentos`: sin resultados.

Esto es esperado porque todavia no se han copiado estructuras de origen hacia el entorno local.

## Pendientes

- Ejecutar inventario contra origen con permisos solo lectura.
- Revisar columna de fecha de `documentos`.
- Crear scripts de copia local despues del inventario.

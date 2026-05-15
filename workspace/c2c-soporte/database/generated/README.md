# Artefactos generados

## Objetivo

Guardar scripts generados localmente para exportar/importar datos durante copias controladas.

## Regla

Los artefactos generados no se versionan porque pueden contener nombres de tablas, columnas o rutas locales derivadas del inventario.

## Flujo

1. Generar scripts con `database/scripts/generate-copy-block1.ps1`.
2. Revisar scripts generados.
3. Ejecutar export desde origen en modo read-only.
4. Ejecutar create/import contra local `soporte`.
5. Validar conteos locales.


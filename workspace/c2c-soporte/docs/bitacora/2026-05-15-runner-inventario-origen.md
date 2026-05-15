# Bitacora - Runner inventario origen

## Fecha

2026-05-15

## Objetivo

Preparar un runner local para exportar inventarios de origen `public` a CSV sin versionar resultados.

## Cambios

- Crear `database/scripts/export-source-inventory.ps1`.
- Crear `database/inventory/README.md`.
- Crear `database/inventory/source/.gitignore`.

## Seguridad

- El script solo ejecuta consultas `source-readonly`.
- Requiere parametros explicitos de conexion.
- Los CSV generados quedan ignorados por Git.
- Se debe usar usuario solo lectura.

## Pendientes

- Ejecutar contra origen real cuando se confirme host, puerto, base y usuario solo lectura.
- Revisar CSV generados antes de preparar scripts de copia.


# Bitacora - Generador copia bloque 1

## Fecha

2026-05-15

## Objetivo

Crear un generador local para preparar la copia controlada de las tablas candidatas del bloque 1.

## Cambios

- Crear `database/scripts/generate-copy-block1.ps1`.
- Crear carpeta `database/generated/` ignorada por Git.
- Documentar que origen y destino son bases distintas, por lo que se usara export/import CSV.

## Seguridad

- Los scripts generados no se versionan.
- La exportacion desde origen usa `default_transaction_read_only=on`.
- No incluye tablas grandes ni especiales.
- No ejecuta copia automaticamente.

## Ajuste tecnico

El generador crea archivos SQL temporales por tabla y los ejecuta con `psql -f`. Esto evita conflictos entre comillas de PowerShell y comillas SQL en nombres de columnas/tablas.

## Validacion

- Generacion local validada en `database/generated/copy-block1/20260515-030016`.
- Manifiesto generado con 35 tablas.
- Tablas especiales excluidas del manifiesto: `documentos`, `enviosiidocs`, `cierrecaja_documento`, `documentos_fecha_normalizada`, `contabilizaciondocs`, `sincronizacionsap`, `mv_device_operacion`.
- Sintaxis PowerShell validada para generador, export e import generados.
- Backend validado con `npm test`: 9 pruebas OK.

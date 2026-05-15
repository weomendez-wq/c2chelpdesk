# Bitacora - Master con sesion read-only

## Fecha

2026-05-15

## Objetivo

Documentar la alternativa aprobada para inventario de origen cuando no existe usuario solo lectura.

## Decision

Usar el usuario `master` solo para inventario, con sesion forzada a solo lectura mediante `PGOPTIONS`.

## Implementacion

El runner `database/scripts/export-source-inventory.ps1` ahora acepta:

```powershell
-ReadOnlySession
```

Ese switch configura temporalmente:

```txt
default_transaction_read_only=on
statement_timeout=30000
lock_timeout=5000
```

## Seguridad

- No se guardan credenciales en archivos versionados.
- Los CSV generados quedan ignorados por Git.
- El uso de `master` queda restringido a inventario read-only.

## Validacion local

Se ejecuto el runner sin password ni conexion efectiva para validar el flujo. En esta terminal `psql` no esta disponible en `PATH`, por lo que el script detuvo la ejecucion con un error claro antes de intentar conectarse.

Resultado esperado:

```txt
psql no esta disponible en PATH. Abre una terminal con PostgreSQL configurado o usa la ruta completa de psql.
```

## Pendiente operativo

Ejecutar desde una terminal donde `psql` este disponible, configurando `PGPASSWORD` temporalmente y usando `-ReadOnlySession`.

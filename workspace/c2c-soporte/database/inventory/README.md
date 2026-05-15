# Inventarios de base de datos

## Objetivo

Guardar resultados locales de inventario de origen para analizar la estrategia de copia controlada.

## Regla

Los resultados exportados no se versionan porque pueden contener nombres de tablas, columnas o metadatos sensibles.

## Uso recomendado

Ejecutar desde `workspace/c2c-soporte`:

```powershell
.\database\scripts\export-source-inventory.ps1 `
  -HostName "<host_origen>" `
  -Port 5432 `
  -Database "<base_origen>" `
  -User "<usuario_solo_lectura>" `
  -ReadOnlySession
```

El script pedira password si `psql` lo requiere.

## Alternativa con usuario master controlado

Si no existe usuario solo lectura, usar `-ReadOnlySession` obligatoriamente:

```powershell
$env:PGPASSWORD="<password_temporal>"

.\database\scripts\export-source-inventory.ps1 `
  -HostName "localhost" `
  -Port 5432 `
  -Database "dte" `
  -User "master" `
  -ReadOnlySession

Remove-Item Env:\PGPASSWORD
```

`-ReadOnlySession` configura temporalmente:

```txt
default_transaction_read_only=on
statement_timeout=30000
lock_timeout=5000
```

## Salida

```txt
database/inventory/source/YYYYMMDD-HHMMSS/*.csv
```

## Seguridad

- Usar usuario solo lectura.
- Si se usa `master`, ejecutar solo con `-ReadOnlySession`.
- No subir CSV generados al repositorio.
- Revisar resultados antes de crear scripts de copia.

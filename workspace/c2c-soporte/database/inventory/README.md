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
  -User "<usuario_solo_lectura>"
```

El script pedira password si `psql` lo requiere.

## Salida

```txt
database/inventory/source/YYYYMMDD-HHMMSS/*.csv
```

## Seguridad

- Usar usuario solo lectura.
- No ejecutar contra origen con usuario administrador.
- No subir CSV generados al repositorio.
- Revisar resultados antes de crear scripts de copia.


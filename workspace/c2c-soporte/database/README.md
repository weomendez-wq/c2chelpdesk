# Database C2C Soporte

## Objetivo

Centralizar scripts SQL locales del proyecto C2C Soporte / DTE / Torre de Control.

## Regla principal

Estos scripts son para entorno local. No se deben ejecutar contra una base productiva sin revision explicita.

## Base local objetivo

```txt
soporte
```

## Schemas locales objetivo

- `staging_public`: copia controlada, snapshots y staging local.
- `rr_gestion_soporte`: views, materialized views, metricas, helpers, control y logging.

## Orden recomendado

1. Conectarse a la base administrativa `postgres`.
2. Ejecutar `sql/00-create-database.sql`.
3. Conectarse a la base local `soporte`.
4. Ejecutar `sql/01-create-schemas.sql`.
5. Validar con `sql/99-verify-local.sql`.

## Comandos de referencia

```powershell
psql -U postgres -d postgres -f .\database\sql\00-create-database.sql
psql -U postgres -d soporte -f .\database\sql\01-create-schemas.sql
psql -U postgres -d soporte -f .\database\sql\99-verify-local.sql
```

## Pendiente

Confirmar usuario, host, puerto y credenciales locales antes de ejecutar.


# Bitacora - Database local

## Fecha

2026-05-15

## Objetivo

Preparar scripts SQL iniciales para crear la base local `soporte` y los schemas requeridos sin ejecutar nada contra bases productivas.

## Cambios

- Crear README de `database`.
- Crear script `00-create-database.sql`.
- Crear script `01-create-schemas.sql`.
- Crear script `99-verify-local.sql`.

## Seguridad

Los scripts quedan documentados como uso local. No se ejecutan automaticamente y no se conectan a ninguna base desde Codex en este bloque.

## Pendientes

- Validar conexion desde backend con `DATABASE_URL=postgres://postgres:postgres@localhost:5434/soporte`.
- Probar endpoint SQL explain contra la base local.

## Actualizacion

Rodrigo ejecuto los scripts localmente. La conexion local confirmada usa:

```txt
host: localhost
port: 5434
user: postgres
password: postgres
database: soporte
```

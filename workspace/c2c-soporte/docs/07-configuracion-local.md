# Configuracion local

## Objetivo

Definir como se preparara el entorno local antes de crear codigo.

## Variables esperadas

```txt
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://usuario:password@localhost:5432/soporte
LOG_LEVEL=debug
```

## Reglas

- No versionar archivos `.env` reales.
- Crear `.env.example` cuando se inicialice backend o frontend.
- Validar variables de entorno con Zod al iniciar la aplicacion.
- Separar configuracion local, pruebas y produccion.

## Base de datos local

- Nombre objetivo: `soporte`.
- Schemas objetivo:
  - `staging_public`
  - `rr_gestion_soporte`

## Pendientes

- Confirmar si PostgreSQL local ya esta instalado.
- Confirmar credenciales locales.
- Ejecutar scripts SQL base despues de validar la conexion local.

## Scripts SQL locales

```txt
database/sql/00-create-database.sql
database/sql/01-create-schemas.sql
database/sql/99-verify-local.sql
```

No se ejecutan automaticamente. Primero se debe confirmar que la conexion apunta al PostgreSQL local correcto.

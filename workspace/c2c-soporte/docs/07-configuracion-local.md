# Configuracion local

## Objetivo

Definir como se preparara el entorno local antes de crear codigo.

## Variables esperadas

```txt
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5434/soporte
LOG_LEVEL=debug
```

## Reglas

- No versionar archivos `.env` reales.
- Crear `.env.example` cuando se inicialice backend o frontend.
- Validar variables de entorno con Zod al iniciar la aplicacion.
- Separar configuracion local, pruebas y produccion.

## Base de datos local

- Nombre objetivo: `soporte`.
- Host local: `localhost`.
- Puerto local: `5434`.
- Usuario local confirmado: `postgres`.
- Schemas objetivo:
  - `staging_public`
  - `rr_gestion_soporte`

## Estado confirmado

- PostgreSQL local disponible en puerto `5434`.
- Usuario local: `postgres`.
- Scripts SQL base ejecutados localmente.

## Pendientes

- Crear `.env` local real a partir de `.env.example` si se requiere ejecutar el backend manualmente.
- Probar `EXPLAIN` sobre tablas de negocio cuando exista carga local controlada.

## Validacion desde backend

- Conexion desde Node con `pg`: OK.
- Endpoint `POST /api/admin/sql/explain` contra `soporte`: OK.
- Schemas confirmados: `staging_public` y `rr_gestion_soporte`.

## Scripts SQL locales

```txt
database/sql/00-create-database.sql
database/sql/01-create-schemas.sql
database/sql/99-verify-local.sql
database/sql/10-inspect-schemas.sql
database/sql/11-inspect-tables-columns.sql
database/sql/12-inspect-indexes.sql
database/sql/13-inspect-table-estimates.sql
```

No se ejecutan automaticamente. Ya fueron ejecutados en el entorno local confirmado.

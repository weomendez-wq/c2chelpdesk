# C2C Soporte / DTE / Torre de Control

## Objetivo

Espacio reservado para preparar el proyecto C2C Soporte / DTE / Torre de Control dentro del workspace maestro.

## Estado actual

Base documental, backend inicial y herramientas de inventario/copia controlada en curso.

## Alcance inicial

- Documentar reglas del proyecto.
- Preparar estructura base.
- Separar backend, frontend, database, scripts e infra cuando corresponda.
- Mantener reglas SQL estrictas para entorno productivo y local.

## Estructura actual

```txt
workspace/c2c-soporte/
├── AGENTS.md
├── README.md
├── backend/
├── frontend/
├── database/
├── scripts/
├── infra/
└── docs/
```

## Documentacion

- `docs/00-vision.md`
- `docs/01-arquitectura.md`
- `docs/02-backend.md`
- `docs/03-frontend.md`
- `docs/04-sql.md`
- `docs/05-observabilidad.md`
- `docs/06-roadmap.md`
- `docs/07-configuracion-local.md`
- `docs/08-api-estandar.md`
- `docs/decisiones/`
- `docs/bitacora/`

## Stack definido

- Backend: Node.js + Express + TypeScript + Zod + Pino + `pg`.
- Frontend: React + Vite + TypeScript + Tailwind.
- Datos UI: TanStack Query y TanStack Table.
- Graficos: Recharts.
- Base de datos: PostgreSQL.

## Backend inicial

El backend minimo esta en `backend/` e incluye healthcheck, logger, `requestId`, validacion de entorno y formato API estandar. Antes de ejecutarlo se deben instalar dependencias con `npm install` dentro de `backend/`.

## Database inicial

Los scripts locales estan en `database/sql/` y preparan la base `soporte` con schemas `staging_public` y `rr_gestion_soporte`. No se ejecutan automaticamente ni deben usarse contra produccion.

La conexion local validada usa PostgreSQL en `localhost:5434` con base `soporte`.

La estrategia de copia controlada esta documentada en `docs/09-estrategia-copia-controlada.md`.

Los resultados de inventario de origen deben guardarse localmente en `database/inventory/source/`; esa carpeta ignora CSV generados para evitar subir metadatos sensibles.

El resumen del inventario actual esta en `docs/10-resumen-inventario-origen.md`.

El plan de copia controlada esta en `docs/11-plan-copia-controlada.md`.

El plan para tablas especiales del bloque 2 esta en `docs/12-plan-bloque2-tablas-especiales.md`.

Los scripts generados para copia controlada quedan en `database/generated/` y no se versionan.

## Regla principal

No ejecutar cambios sobre base productiva ni crear scripts SQL sin documentar antes el objetivo, el alcance y la forma de validacion.

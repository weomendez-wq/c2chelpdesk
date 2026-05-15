# Bitacora - Decision de stack

## Fecha

2026-05-15

## Objetivo

Cerrar decisiones tecnicas base antes de crear codigo de aplicacion.

## Decisiones

- Usar TypeScript en backend y frontend.
- Usar Express, Zod, Pino y `pg` en backend.
- Usar React, Vite, Tailwind, TanStack Query, TanStack Table y Recharts en frontend.
- Evitar ORM en la primera etapa.
- Definir formato de respuesta API con `ok`, `data` o `error`, y `meta.requestId`.

## Motivo

Estas decisiones reducen ambiguedad antes de inicializar el proyecto y mantienen el foco en seguridad SQL, observabilidad y trazabilidad.

## Pendientes

- Crear scaffolding tecnico.
- Crear `.env.example`.
- Validar entorno local de Node y PostgreSQL.


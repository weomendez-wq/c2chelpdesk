# C2C Soporte / DTE / Torre de Control

## Objetivo

Espacio reservado para preparar el proyecto C2C Soporte / DTE / Torre de Control dentro del workspace maestro.

## Estado actual

Base documental y estructura inicial. Todavia no contiene codigo de aplicacion.

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
- `docs/bitacora/`

## Regla principal

No ejecutar cambios sobre base productiva ni crear scripts SQL sin documentar antes el objetivo, el alcance y la forma de validacion.

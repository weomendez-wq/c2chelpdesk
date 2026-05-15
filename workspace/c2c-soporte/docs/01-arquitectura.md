# Arquitectura

## Estructura objetivo

```txt
backend/
frontend/
database/
scripts/
infra/
docs/
```

## Principios

- Separar responsabilidades por modulo.
- Mantener SQL critico revisable y documentado.
- Centralizar metricas en views o materialized views cuando corresponda.
- Evitar que el frontend consuma directamente tablas productivas sensibles.


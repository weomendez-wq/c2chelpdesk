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
- Ordenar el frontend desde relaciones de negocio: tenant, empresa, dispositivos, folios, documentos y procesos asociados.
- Mantener las mejoras de normalizacion de base de datos como proyecto posterior, no como cambio implicito del MVP de soporte.

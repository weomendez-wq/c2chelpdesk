# Backend

## Objetivo

Preparar un backend Node.js + Express mantenible, seguro y observable para C2C Soporte / DTE / Torre de Control.

## Responsabilidades iniciales

- Exponer APIs controladas para consulta operativa.
- Centralizar acceso a PostgreSQL en repositories o services.
- Validar entradas antes de ejecutar consultas.
- Bloquear operaciones SQL peligrosas en flujos administrativos.
- Registrar logs estructurados con `requestId`.

## Estructura objetivo

```txt
backend/
├── src/
│   ├── app/
│   ├── config/
│   ├── modules/
│   ├── shared/
│   ├── middlewares/
│   ├── services/
│   ├── repositories/
│   ├── routes/
│   ├── validators/
│   ├── utils/
│   └── jobs/
```

## Pendientes antes de implementar

- Confirmar si se usara JavaScript o TypeScript.
- Definir libreria de validacion, recomendada: Zod.
- Definir logger, recomendado: Pino.
- Definir cliente PostgreSQL y pool de conexiones.


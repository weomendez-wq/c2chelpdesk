# Observabilidad

## Objetivo

Agregar trazabilidad desde el inicio para diagnosticar errores, rendimiento y comportamiento operacional.

## Componentes esperados

- `requestId` por request.
- Logs estructurados.
- Registro de errores con contexto.
- Metricas basicas por endpoint.
- Tiempos de respuesta.
- Trazabilidad para consultas SQL criticas.

## Reglas

- No registrar secretos, tokens ni credenciales.
- No registrar datos sensibles completos si no son necesarios.
- Los errores deben responderse con formato consistente.
- Las consultas pesadas deben quedar asociadas a un identificador trazable.

## Pendientes antes de implementar

- Definir logger.
- Definir formato de respuesta API.
- Definir campos minimos de log.
- Definir estrategia de metricas.


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

- Implementar logger Pino.
- Implementar middleware de `requestId`.
- Implementar formato de respuesta API.
- Definir campos minimos de log en codigo.
- Definir estrategia de metricas.

## Decision inicial

Usar Pino para logs estructurados. Cada request debe incluir `requestId`, metodo, path, statusCode, duracion y nivel de log. No se deben registrar secretos ni tokens.

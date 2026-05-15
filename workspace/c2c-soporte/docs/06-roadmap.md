# Roadmap

## Fase 1 - Entorno y documentacion

- Mantener Git estable.
- Completar documentacion base.
- Definir estructura del proyecto.
- Preparar reglas SQL y contexto Codex.
- Cerrar decisiones tecnicas base.
- Crear scaffolding backend minimo.

## Fase 2 - Base local soporte

- Crear base local `soporte`.
- Crear schemas `staging_public` y `rr_gestion_soporte`.
- Inspeccionar estructura de `public`.
- Preparar copia controlada de datos.

## Fase 3 - Seguridad SQL y observabilidad

- Crear endpoint seguro de `EXPLAIN`.
- Validar SQL.
- Bloquear comandos peligrosos.
- Agregar logger estructurado y `requestId`.
- Estandarizar formato de respuesta API.
- Detectar `Seq Scan` en el plan JSON.

## Fase 4 - Consolidacion backend

- Revisar modulos existentes.
- Centralizar filtros SQL.
- Reducir duplicacion.
- Estandarizar responses API.

## Fase 5 - Analitica y Torre de Control

- Consolidar views y materialized views.
- Crear KPIs globales.
- Crear ranking de empresas y dispositivos.
- Preparar alertas criticas.

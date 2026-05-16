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
- Agregar scripts de inspeccion local de schemas, columnas, indices y estimaciones.
- Preparar inventario de origen `public` solo lectura.
- Clasificar candidatos de copia controlada.
- Definir bloque 1 de copia completa para tablas pequenas.
- Preparar copia controlada de datos.
- Disenar bloque 2 para tablas especiales con `EXPLAIN` previo.

## Fase 3 - Seguridad SQL y observabilidad

- Crear endpoint seguro de `EXPLAIN`.
- Validar SQL.
- Bloquear comandos peligrosos.
- Agregar logger estructurado y `requestId`.
- Estandarizar formato de respuesta API.
- Detectar `Seq Scan` en el plan JSON.
- Agregar pruebas automatizadas del validador SQL.

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

## Fase 6 - Producto soporte y layout v1

- Documentar layout maestro/detalle para soporte.
- Crear componentes base propios: `TenantSelector`, `MetricCard`, `PaginationBar`, `DataTable`, `SkeletonTable`.
- Reorganizar frontend para vista global y empresa seleccionada.
- Conectar paginacion real contra endpoints `control/companies` y `control/devices`.
- Mantener folios/CAF como siguiente dominio certificado, no mezclarlo antes de estabilizar layout.

Avance:

- `TenantSelector`, `MetricCard` y `PaginationBar` implementados.
- Paginacion real conectada a endpoints de empresas y devices.

## Fase 7 - Folios y CAF certificados

- Crear vistas locales de lectura para CAF, folios disponibles e historial.
- Certificar cuadraturas antes de exponer indicadores.
- Exponer endpoint `GET /api/support/control/folios`.
- Integrar cards compactas de folios en el detalle de empresa.
- Mantener la normalizacion estructural como proyecto posterior.

## Fase 8 - Historial anual y cajeros

- Crear modelo local de resumen historico anual sin copiar documentos completos.
- Incorporar metricas de cajeros/devices con ranking, actividad y primer/ultimo folio.
- Estimar agotamiento de folios por empresa, tipo documento y consumo real.
- Modelar rangos de folios caducados, actuales y por ocupar.
- Definir ejecucion anual manual con auditoria y permisos.
- Mantener cualquier extraccion desde `dte.public` como solo lectura agregada.

## Fase posterior - Normalizacion base de datos

- Usar este proyecto como baseline operativo.
- Documentar oportunidades de normalizacion detectadas.
- Evaluar claves, tipos de datos, fechas, indices y datos derivados.
- Proponer mejoras de rendimiento con evidencia local.
- No aplicar cambios estructurales sobre origen productivo desde este proyecto.

# C2C Soporte / DTE / Torre de Control

## Objetivo

Espacio reservado para preparar el proyecto C2C Soporte / DTE / Torre de Control dentro del workspace maestro.

## Estado actual

Base documental, backend inicial, frontend inicial y herramientas de inventario/copia controlada en curso.

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
- `docs/15-manual-usuario-primario.md`
- `docs/16-consultas-control-operativo.md`
- `docs/decisiones/`
- `docs/bitacora/`

## Stack definido

- Backend: Node.js + Express + TypeScript + Zod + Pino + `pg`.
- Frontend: React + Vite + TypeScript.
- Datos UI iniciales: `fetch` encapsulado en services.
- UI posterior evaluable: Tailwind, TanStack Query, TanStack Table y Recharts cuando el flujo lo justifique.
- Base de datos: PostgreSQL.

## Backend inicial

El backend minimo esta en `backend/` e incluye healthcheck, logger, `requestId`, validacion de entorno y formato API estandar. Antes de ejecutarlo se deben instalar dependencias con `npm install` dentro de `backend/`.

## Frontend inicial

El frontend inicial esta en `frontend/` y consume `GET /api/support/company-devices` para la vista operativa Empresa -> Dispositivos. Antes de ejecutarlo se deben instalar dependencias con `npm install` dentro de `frontend/`.

## Database inicial

Los scripts locales estan en `database/sql/` y preparan la base `soporte` con schemas `staging_public` y `rr_gestion_soporte`. No se ejecutan automaticamente ni deben usarse contra produccion.

La conexion local validada usa PostgreSQL en `localhost:5434` con base `soporte`.

La estrategia de copia controlada esta documentada en `docs/09-estrategia-copia-controlada.md`.

Los resultados de inventario de origen deben guardarse localmente en `database/inventory/source/`; esa carpeta ignora CSV generados para evitar subir metadatos sensibles.

El resumen del inventario actual esta en `docs/10-resumen-inventario-origen.md`.

El plan de copia controlada esta en `docs/11-plan-copia-controlada.md`.

El plan para tablas especiales del bloque 2 esta en `docs/12-plan-bloque2-tablas-especiales.md`.

El plan especifico para `documentos` esta en `docs/13-plan-documentos.md`.

El orden funcional para iniciar el frontend esta en `docs/14-orden-funcional-frontend.md`.

El manual primario para validar frontend y backend juntos esta en `docs/15-manual-usuario-primario.md`.

Las consultas actuales y propuestas para control operativo estan en `docs/16-consultas-control-operativo.md`.

El analisis de scripts SQL pendientes de integrar esta en `docs/17-analisis-querys-integrar.md`.

Las referencias seleccionadas desde `layoutExample` se preservaron en `docs/referencias-layout/` para no perder componentes antes de eliminar esa carpeta.

Las funciones SQL historicas seleccionadas desde `layoutExample/FUNCIONES_C2C_SOPORTE` se preservaron en `docs/referencias-funciones/`.

El diseno del bloque folios/CAF esta en `docs/18-diseno-folios-caf.md`.

El diseno de historial anual, cajeros y proyeccion de folios esta en `docs/19-diseno-historial-cajeros-folios.md`.

La normalizacion de querys rescatadas desde `layoutExample` esta en `docs/20-normalizacion-querys-layoutExample.md`; su referencia fechada queda en `docs/referencias-funciones/2026-05-16-layoutExample-normalizacion/`.

El mapa de modulos de `c2c-helpdesk` esta en `docs/21-mapa-modulos-c2c-helpdesk.md`.

El plan de mantenedores esta en `docs/22-plan-mantenedores-c2c-helpdesk.md`.

El plan de diseno y pruebas esta en `docs/23-plan-diseno-pruebas-c2c-helpdesk.md`.

El plan de optimizacion de querys para evitar timeouts y esperas excesivas esta en `docs/24-plan-optimizacion-querys.md`.

La primera optimizacion local de indices y caches quedo registrada en `docs/bitacora/2026-05-16-optimizacion-querys-local.md`.

El refresco manual de caches locales y su modulo de procesos quedo registrado en `docs/bitacora/2026-05-16-refresco-caches.md`.

El control de vencimiento CAF para facturas electronicas tipo `33` quedo registrado en `docs/bitacora/2026-05-16-vencimiento-caf-facturas.md`. La vigencia y umbral de aviso quedan parametrizados localmente en `rr_gestion_soporte.caf_vencimiento_config`.

Los modulos frontend activos incluyen Torre de Control, Empresas, Cajeros/Devices, Documentos, Folios/CAF, Rangos SII y Alertas. Los endpoints principales estan documentados en `docs/08-api-estandar.md`.

El primer bloque de Mantenedores permite revisar y editar la configuracion local DTE/CAF desde `rr_gestion_soporte.caf_vencimiento_config`; cada cambio registra auditoria local en `rr_gestion_soporte.config_change_log` y requiere refrescar caches para recalcular alertas. La bitacora esta en `docs/bitacora/2026-05-16-mantenedor-dte-caf-editable.md`.

El segundo bloque de Mantenedores permite editar umbrales locales de folios y emision desde `rr_gestion_soporte.folios_alerta_config`, usando la misma auditoria local.

La primera vista de control por empresa se crea con `database/sql/24-create-empresa-control-resumen.sql` y se verifica con `database/sql/25-verify-empresa-control-resumen.sql`.

Las vistas operativas documentales y por device se crean con `database/sql/26-create-documentos-operational-views.sql` y `database/sql/28-create-device-operational-views.sql`; se verifican con `database/sql/27-verify-documentos-operational-views.sql` y `database/sql/29-verify-device-operational-views.sql`.

Las vistas normalizadas de detalle para documentos sin CAF, rangos clasificados y resumen extendido se crean con `database/sql/34-create-folios-normalized-detail-views.sql` y se verifican con `database/sql/35-verify-folios-normalized-detail-views.sql`.

La decision de dejar un branch/proyecto posterior de normalizacion de base de datos esta en `docs/decisiones/2026-05-15-branch-normalizacion-base-datos.md`.

La decision de producto para el layout de soporte v1 esta en `docs/decisiones/2026-05-15-diseno-producto-layout-soporte-v1.md`.

Los scripts generados para copia controlada quedan en `database/generated/` y no se versionan.

## Regla principal

No ejecutar cambios sobre base productiva ni crear scripts SQL sin documentar antes el objetivo, el alcance y la forma de validacion.

Regla critica para `public`: no ejecutar acciones de escritura, eliminacion, actualizacion, bloqueo, permisos, DDL, mantenimiento destructivo ni funciones con efectos laterales. La informacion operacional 2026 debe consultarse desde los objetos locales ya migrados en `staging_public` y `rr_gestion_soporte`.

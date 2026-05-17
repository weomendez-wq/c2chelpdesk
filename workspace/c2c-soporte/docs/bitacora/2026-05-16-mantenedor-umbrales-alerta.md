# Bitacora - Mantenedor de umbrales de alerta

Fecha: 2026-05-16

## Objetivo

Agregar el segundo mantenedor editable del modulo C2C Helpdesk para administrar umbrales locales de alerta asociados a folios y emision, sin ejecutar acciones de escritura sobre el esquema `public` productivo.

## Alcance

- Tabla de configuracion local: `rr_gestion_soporte.folios_alerta_config`.
- Auditoria local: `rr_gestion_soporte.config_change_log`.
- Scope de auditoria: `FOLIOS_ALERT_CONFIG`.
- Endpoints backend:
  - `GET /api/support/control/maintainers/folios-alert-config`
  - `PATCH /api/support/control/maintainers/folios-alert-config/:configId`
- Vista frontend: modulo `Mantenedores`, seccion `Umbrales / Alertas de folios y emision`.

## Reglas funcionales

- El cambio exige confirmacion explicita `UPDATE_FOLIOS_ALERT_CONFIG`.
- Los valores deben ser enteros mayores o iguales a cero.
- El umbral urgente de folios no puede superar el umbral warning.
- Cada actualizacion queda registrada en auditoria local con estado anterior y nuevo.
- Despues de guardar cambios se debe refrescar manualmente cualquier cache operativo relacionado.

## Validacion

- Backend `npm run typecheck`: OK.
- Backend `npm run build`: OK.
- Frontend `npm run typecheck`: OK.
- Frontend `npm run build`: OK.
- `GET /api/support/control/maintainers/folios-alert-config`: OK.
- `PATCH /api/support/control/maintainers/folios-alert-config/1`: OK con valores equivalentes a la configuracion actual para validar flujo y auditoria.
- Auditoria confirmada en `rr_gestion_soporte.config_change_log` con `config_scope = 'FOLIOS_ALERT_CONFIG'`.

## Notas de seguridad

Este bloque solo consulta y actualiza tablas locales del esquema `rr_gestion_soporte`. No modifica `public`, `staging_public` ni tablas de documentos operacionales.

# Mantenedor DTE CAF editable

Fecha: 2026-05-16

## Objetivo

Habilitar la primera edicion controlada de mantenedores locales para configuracion DTE/CAF.

## Alcance

Tabla editable:

```txt
rr_gestion_soporte.caf_vencimiento_config
```

Tabla de auditoria:

```txt
rr_gestion_soporte.config_change_log
```

No se modifica:

```txt
public
staging_public
xml_caf
documentos
caf origen
```

## Endpoint agregado

```txt
PATCH /api/support/control/maintainers/dte-config/:configId
```

Confirmacion requerida:

```txt
UPDATE_DTE_CONFIG
```

## UI

El modulo Mantenedores permite editar por fila:

- nombre visible DTE
- vigencia CAF en meses
- dias de warning
- aplica vencimiento
- activo/inactivo

El guardado muestra confirmacion previa. Despues de guardar, se debe ejecutar el refresco manual de caches desde Procesos para recalcular alertas y rangos.

## Validacion

```txt
backend typecheck OK
backend build OK
frontend typecheck OK
frontend build OK
GET /api/support/control/maintainers/dte-config OK
PATCH /api/support/control/maintainers/dte-config/1 OK
```

Auditoria local validada:

```txt
rr_gestion_soporte.config_change_log
scope: DTE_CAF_CONFIG
action: UPDATE
```

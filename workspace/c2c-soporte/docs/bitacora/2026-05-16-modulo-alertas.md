# Modulo Alertas

Fecha: 2026-05-16

## Objetivo

Agregar una bandeja operacional de alertas para que soporte vea primero los riesgos que requieren revision, sin navegar tabla por tabla.

## Criterio de seguridad

- No tocar `public`.
- No ejecutar acciones de escritura, actualizacion, eliminacion, bloqueo o truncado contra la base `dte`.
- Leer solo vistas locales de `rr_gestion_soporte`.
- Mantener Rangos SII fuera de esta primera bandeja porque la consulta de rangos puede acercarse al timeout.

## Fuentes iniciales

```txt
rr_gestion_soporte.empresa_control_resumen
rr_gestion_soporte.device_control_resumen
rr_gestion_soporte.folios_control_resumen
rr_gestion_soporte.folios_proyeccion_agotamiento
```

## Endpoint

```txt
GET /api/support/control/alerts
```

Filtros previstos:

- `limit`
- `offset`
- `search`
- `tenantId`
- `rut`
- `severity`
- `source`

## Resultado esperado

- Cards por criticidad visible.
- Tabla compacta con empresa, tenant, fuente, severidad, detalle, metrica principal y fecha de referencia.
- Al seleccionar una empresa, la bandeja debe quedar acotada al tenant/RUT seleccionado.

## Pendiente posterior

- Evaluar si Rangos SII debe alimentar una alerta agregada optimizada, idealmente con una vista o resumen materializado local.
- Definir mantenedor de umbrales para que soporte ajuste criterios sin modificar SQL.

# Vencimiento CAF facturas electronicas

Fecha: 2026-05-16

## Objetivo

Incorporar control de vencimiento para CAF de facturas electronicas tipo `33`.

## Contexto funcional

El cliente actualmente emite:

- `39`: Boletas electronicas.
- `41`: Boletas exentas electronicas.
- `33`: Facturas electronicas.

Para facturas electronicas tipo `33`, el CAF tiene una vigencia operativa de 6 meses. Se debe avisar desde el mes previo al vencimiento para gestionar folios antes de que queden inutilizables.

## Campo origen

Tabla local:

```txt
staging_public.caf
```

Campo:

```txt
xml_caf
```

Tag detectado en XML:

```xml
<FA>YYYY-MM-DD</FA>
```

Interpretacion:

- `FA`: fecha de autorizacion/entrega del CAF por SII.
- `vencimiento_caf`: `FA + 6 meses`, solo para `document_type = 33`.

## Reglas de alerta iniciales

```txt
URGENTE: CAF tipo 33 vencido o vence hoy.
WARNING: CAF tipo 33 vence dentro de los proximos 30 dias.
OK: CAF tipo 33 con mas de 30 dias restantes.
NO_APLICA: documentos 39 y 41.
SIN_FECHA_CAF: CAF tipo 33 sin tag FA interpretable.
```

## Seguridad

- No tocar `public`.
- No modificar XML CAF original.
- Extraer solo fecha `FA` a objetos locales de soporte.
- No exponer `xml_caf` en API ni frontend.

## Objetos locales planificados

```txt
rr_gestion_soporte.caf_vencimiento_resumen
rr_gestion_soporte.caf_vencimiento_cache
```

## Implementacion

Script local:

```txt
database/sql/performance/47-create-caf-expiration-control.sql
```

Objetos creados:

```txt
rr_gestion_soporte.caf_vencimiento_resumen
rr_gestion_soporte.caf_vencimiento_cache
```

Columnas agregadas a `rr_gestion_soporte.folios_rangos_clasificados_cache`:

```txt
caf_fecha_autorizacion
caf_fecha_vencimiento
caf_dias_para_vencer
nivel_alerta_caf_vencimiento
```

## Integracion

- Rangos SII: mostrar fecha CAF, vencimiento y dias restantes.
- Alertas: agregar fuente `CAF_VENCIMIENTO` para facturas `33` vencidas o por vencer.
- Refresco caches: recalcular vencimientos junto al proceso manual existente.

## Resultado local

```txt
33 OK:      10 CAF
33 URGENTE: 1 CAF
39 NO_APLICA: 359 CAF
41 NO_APLICA: 4 CAF
```

Despues del refresh manual:

```txt
caf_vencimiento_cache: 374
alertas_operativas_cache: 305
```

Alerta detectada:

```txt
source: CAF_VENCIMIENTO
severity: URGENTE
tipo DTE: 33
CAF: 6040
FA: 2025-06-18
vence: 2025-12-18
```

## Validacion

```txt
backend typecheck OK
frontend typecheck OK
frontend build OK
GET /api/support/control/alerts?source=CAF_VENCIMIENTO OK
GET /api/support/control/folio-ranges?documentType=33 OK
```

# Bitacora - Analisis querys integrar

## Fecha

2026-05-15

## Objetivo

Revisar los scripts dejados en `database/integrar/` antes de integrarlos al proyecto.

## Resultado

Se detectaron tres grupos:

- Normalizacion documental y facts.
- Total mensual de documentos.
- Monitoreo de cajeros/devices.

## Hallazgos

- Los scripts referencian `documentos`, pero la base local usa `rr_gestion_soporte.documentos_2026`.
- Los scripts referencian `rr_gestion_soporte.gsoporte_device`, pero la base local usa `staging_public.device`.
- Los scripts dependen de `rr_gestion_soporte.gsoporte_safe_parse_timestamp`, funcion que no existe localmente.
- Varios scripts hacen `DROP TABLE`, por lo que no deben ejecutarse directamente.

## Decision

No ejecutar scripts heredados directamente. Integrar la logica en scripts nuevos, no destructivos y adaptados a la base local actual.

## Decision de implementacion

La primera integracion se hara con vistas de lectura:

- `rr_gestion_soporte.documentos_2026_normalizados`
- `rr_gestion_soporte.documentos_2026_mensual`
- `rr_gestion_soporte.documentos_2026_device_mensual`
- `rr_gestion_soporte.device_control_resumen`

No se integraran aun cargas incrementales, tablas fisicas, materialized views ni controles ETL.

La causa es que los scripts heredados mezclan analisis, carga y optimizacion. Para certificar numeros primero se necesita una capa consultable que cuadre contra `rr_gestion_soporte.documentos_2026`.

## Limpieza posterior

Se quitaron todas las lineas con `DROP` de los scripts en `database/integrar/`.

Validacion:

```txt
DROP en database/integrar/*.sql: 0 coincidencias
public en database/integrar/*.sql: 0 coincidencias
```

No se elimino ningun archivo.

## Implementacion inicial validada

Se crearon y ejecutaron localmente los scripts:

```txt
database/sql/26-create-documentos-operational-views.sql
database/sql/27-verify-documentos-operational-views.sql
database/sql/28-create-device-operational-views.sql
database/sql/29-verify-device-operational-views.sql
```

Resultado documental:

```txt
documentos_2026_normalizados: 3919488
documentos_2026 base:        3919488
fechas invalidas:            0
```

Documentos por periodo:

```txt
2026-01: 888389
2026-02: 857721
2026-03: 912756
2026-04: 857704
2026-05: 402918
```

Resultado devices:

```txt
device_control_resumen: 402
staging_public.device:  402
```

Devices por status:

```txt
active:    349
disabled:   50
suspended:   3
```

Alertas iniciales:

```txt
URGENTE:     55
SIN_EMISION: 155
WARNING:      6
OK:         186
```

Consistencia inicial:

```txt
ACTIVO_SIN_EMISION:           106
ACTIVO_SIN_EMISION_RECIENTE:   57
NO_ACTIVO_CON_EMISION:          4
OK:                           235
```

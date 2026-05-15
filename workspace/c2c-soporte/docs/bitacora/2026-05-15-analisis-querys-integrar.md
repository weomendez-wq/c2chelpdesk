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

## Limpieza posterior

Se quitaron todas las lineas con `DROP` de los scripts en `database/integrar/`.

Validacion:

```txt
DROP en database/integrar/*.sql: 0 coincidencias
public en database/integrar/*.sql: 0 coincidencias
```

No se elimino ningun archivo.

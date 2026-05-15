# Decision - Branch posterior de normalizacion de base de datos

## Fecha

2026-05-15

## Contexto

El proyecto actual esta construyendo una base local operativa para soporte, analitica y frontend, usando copia controlada desde la base origen.

Durante el inventario se detectaron oportunidades futuras:

- Tablas con datos derivados o normalizados parcialmente.
- Campos de fecha almacenados como texto.
- Indices funcionales necesarios para consultas de alto volumen.
- Tablas grandes que requieren ventanas, filtros o derivacion local.
- Necesidad de ordenar el modelo por relaciones de negocio antes de proponer mejoras estructurales.

## Decision

Dejar establecido un branch/proyecto posterior de normalizacion de base de datos.

Este branch no modifica el alcance inmediato del proyecto C2C Soporte. Se abordara despues de tener:

1. Inventario local validado.
2. Copia controlada suficiente para soporte.
3. Vistas operativas por relacion de negocio.
4. Primer frontend consumiendo datos ordenados.
5. Evidencia de consultas lentas, duplicacion o problemas de modelado.

## Objetivo futuro

Proponer mejoras de modelo y rendimiento sobre la base de datos, incluyendo:

- Normalizacion de entidades principales.
- Revision de claves primarias y llaves logicas.
- Separacion entre datos fuente, datos derivados y vistas operativas.
- Estandarizacion de tipos de fecha.
- Estrategia de indices para procesos criticos.
- Posibles materialized views o tablas resumen.
- Plan de migracion incremental y reversible.

## Regla

No aplicar cambios estructurales sobre origen productivo desde este proyecto.

Toda propuesta de normalizacion debe quedar documentada, probada primero en local y respaldada por evidencia de rendimiento o necesidad funcional.

# Bitacora - Plan copia controlada

## Fecha

2026-05-15

## Objetivo

Actualizar el plan de copia con estadisticas frescas del origen.

## Hallazgos

- Las estimaciones ya no tienen `-1`.
- Hay 35 tablas candidatas a copia completa.
- `documentos` directo por `fechaemision` genera `Seq Scan`.
- `documentos_fecha_normalizada` usa `Index Only Scan` por `fecha`.

## Decision

El primer bloque de copia debe limitarse a tablas candidatas a copia completa. Las tablas grandes y especiales quedan fuera.

## Pendientes

- Crear generador de SQL para el bloque 1.
- Revisar estrategia especifica para `documentos`.


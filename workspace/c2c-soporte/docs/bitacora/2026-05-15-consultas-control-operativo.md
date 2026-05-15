# Bitacora - Consultas control operativo

## Fecha

2026-05-15

## Objetivo

Documentar las consultas actuales y las consultas nuevas que se incorporaran para validar informacion operativa por etapas.

## Criterio

La primera pantalla mostro informacion real, pero todavia no suficientemente segura para analisis operativo. Se definio avanzar por cuadratura:

```txt
empresa -> device -> caf -> historial folios -> folios disponibles -> documentos -> alertas
```

## Resultados observados

- Empresas: 86 total, 86 activas, 0 no activas.
- Devices: 402 total, 349 activos, 50 disabled, 3 suspended.
- CAF: 374 cargas, 53.608.759 folios otorgados.
- Historial asignacion folios: 17.253 cargas, 22.933.100 folios por rango, 22.992.275 solicitados.
- Documentos 2026: 3.919.488.
- Empresas sin documentos 2026: 18.

## Decision

No seguir ampliando el frontend sobre `empresa_dispositivo_resumen` como vista unica. Primero crear consultas/vistas de control por dominio para certificar que los numeros cuadren.

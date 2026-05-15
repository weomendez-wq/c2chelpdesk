# Bitacora - Empresa control resumen

## Fecha

2026-05-15

## Objetivo

Crear la primera vista de control operativo acotada solo al dominio empresa.

## Alcance

- Certificar total de empresas.
- Certificar estados de empresa.
- Identificar empresas con y sin documentos emitidos en 2026.
- Calcular primera y ultima emision.
- Calcular dias sin emitir.
- Clasificar alerta inicial: `OK`, `WARNING`, `URGENTE`, `SIN_EMISION`.

## Criterio

No se mezcla `device`, CAF ni folios en esta primera vista. La finalidad es validar que los numeros de empresa cuadren antes de avanzar a relaciones.

## Validacion local

Scripts ejecutados:

```txt
database/sql/24-create-empresa-control-resumen.sql
database/sql/25-verify-empresa-control-resumen.sql
```

Resultado:

```txt
empresas: 86
activas: 86
no_activas: 0
cuadratura_estado_ok: true
```

Alertas por emision:

```txt
OK: 60
SIN_EMISION: 18
URGENTE: 8
```

Empresas por documentos:

```txt
empresas_sin_documentos: 18
empresas_con_documentos: 68
```

Observacion:

- La vista confirma cuadratura por estado de empresa.
- Las 18 empresas sin documentos y las 8 empresas urgentes deben revisarse como casos operativos antes de mezclar con device, CAF o folios.

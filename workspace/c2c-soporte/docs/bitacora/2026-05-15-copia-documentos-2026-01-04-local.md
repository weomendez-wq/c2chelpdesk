# Bitacora - Copia local documentos enero-abril 2026

## Fecha

2026-05-15

## Objetivo

Ejecutar localmente la copia controlada de `documentos` para enero, febrero, marzo y abril 2026.

## Alcance

Origen:

```txt
public.documentos
```

Destinos:

- `staging_public.documentos_2026_01`
- `staging_public.documentos_2026_02`
- `staging_public.documentos_2026_03`
- `staging_public.documentos_2026_04`

## Criterio

Se usa el generador parametrizable `database/scripts/generate-copy-documentos-window.ps1`.

Cada mes queda en tabla independiente para evitar confundir ventanas con una copia completa de `documentos`.

## Artefactos locales

```txt
database/generated/copy-documentos-window/
```

Directorios:

- `documentos_2026_01-20260515-084019`
- `documentos_2026_02-20260515-084019`
- `documentos_2026_03-20260515-084019`
- `documentos_2026_04-20260515-084019`

Estos archivos no se versionan.

## Resultado

| Tabla local | Filas origen | Filas locales | Diferencia |
| --- | ---: | ---: | ---: |
| `documentos_2026_01` | 888389 | 888389 | 0 |
| `documentos_2026_02` | 857721 | 857721 | 0 |
| `documentos_2026_03` | 912756 | 912756 | 0 |
| `documentos_2026_04` | 857704 | 857704 | 0 |
| Total | 3516570 | 3516570 | 0 |

## Resultado acumulado documentos 2026

Con `documentos_2026_05` ya importada, el total local de ventanas 2026 es:

```txt
3919488 filas
```

## Siguiente paso

Crear vistas locales o consultas de soporte sobre las ventanas 2026 antes de decidir si se reconstruye `documentos_fecha_normalizada`.

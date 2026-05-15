# Bitacora - Vistas base soporte

## Fecha

2026-05-15

## Objetivo

Crear vistas locales para iniciar backend/frontend desde relaciones base de negocio.

## Vistas

- `rr_gestion_soporte.empresas_resumen`
- `rr_gestion_soporte.dispositivos_resumen`
- `rr_gestion_soporte.empresa_dispositivo_resumen`

## Criterio

El orden funcional inicial sera:

```txt
tenant -> empresa -> dispositivo -> documentos/procesos
```

Estas vistas son un contrato inicial de lectura local. No son una propuesta de normalizacion del origen.

## Ajuste tecnico

`deviceregistrationkey` puede tener mas de un registro por `tenant_id`. La vista `dispositivos_resumen` usa un agregado por tenant para evitar multiplicar filas de dispositivos.

El script elimina y recrea las vistas en orden porque PostgreSQL no permite cambiar columnas con `CREATE OR REPLACE VIEW` si la vista ya existe con otra estructura.

## Resultado

Conteos validados:

| Vista | Filas |
| --- | ---: |
| `empresas_resumen` | 86 |
| `dispositivos_resumen` | 402 |
| `empresa_dispositivo_resumen` | 406 |

`empresa_dispositivo_resumen` usa `LEFT JOIN` desde empresas, por eso conserva empresas sin dispositivos asociados.

Estados:

- Empresas `active`: 86.
- Dispositivos `active`: 349.
- Dispositivos `disabled`: 50.
- Dispositivos `suspended`: 3.

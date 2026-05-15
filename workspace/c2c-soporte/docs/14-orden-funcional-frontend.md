# Orden funcional frontend

## Objetivo

Construir el frontend desde las relaciones base de negocio, no desde las tablas de mayor volumen.

## Orden inicial

1. Tenant y empresa.
2. Dispositivos y configuracion.
3. Usuarios y permisos.
4. Folios y CAF.
5. Documentos 2026.
6. Procesos asociados: contabilizacion, SAP, SII y cierre de caja.

## Primer bloque frontend

La primera pantalla debe usar la relacion:

```txt
Empresa -> Dispositivos -> Documentos -> Estado/SII/Folios
```

## Vistas base

Scripts:

- `database/sql/22-create-base-support-views.sql`
- `database/sql/23-verify-base-support-views.sql`

Vistas:

- `rr_gestion_soporte.empresas_resumen`
- `rr_gestion_soporte.dispositivos_resumen`
- `rr_gestion_soporte.empresa_dispositivo_resumen`

## Criterio

Estas vistas son de lectura local y sirven como contrato inicial para backend/frontend.

No reemplazan el modelo real ni implican normalizacion de la base origen.

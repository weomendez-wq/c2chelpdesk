# Normalizacion querys layoutExample

Fecha: 2026-05-16

## Objetivo

Portar informacion util de `layoutExample` al proyecto actual sin ejecutar scripts historicos ni tocar `public`.

## Cambios realizados

- Se documento el analisis en `docs/20-normalizacion-querys-layoutExample.md`.
- Se creo referencia fechada en `docs/referencias-funciones/2026-05-16-layoutExample-normalizacion/`.
- Se agregaron vistas locales de solo lectura en `database/sql/34-create-folios-normalized-detail-views.sql`.
- Se agrego verificacion en `database/sql/35-verify-folios-normalized-detail-views.sql`.

## Vistas creadas

```txt
rr_gestion_soporte.documentos_sin_caf_resumen
rr_gestion_soporte.folios_rangos_clasificados_detalle
rr_gestion_soporte.folios_resumen_empresa_extendido
rr_gestion_soporte.folios_resumen_device_extendido
```

## Validacion local

Comando ejecutado contra base local `soporte` en `localhost:5434`:

```txt
psql -h localhost -p 5434 -U postgres -d soporte -v ON_ERROR_STOP=1 -f database/sql/34-create-folios-normalized-detail-views.sql
psql -h localhost -p 5434 -U postgres -d soporte -v ON_ERROR_STOP=1 -f database/sql/35-verify-folios-normalized-detail-views.sql
```

Resultado principal:

```txt
documentos_sin_caf: 0
combinaciones_sin_caf: 0
```

Rangos clasificados:

```txt
AGOTADO / RANGOOCUPADO / RANGOANTERIOR: 38 rangos, 3.673.660 folios, lost_folios 0
CADUCADO_CANDIDATO / RANGOSINUSO / RANGOANTERIOR: 44 rangos, 6.440.000 folios, lost_folios 6.440.000
CADUCADO_CANDIDATO / RANGOSINUSO / RANGOFUTURO: 6 rangos, 645.000 folios, lost_folios 0
EN_USO / RANGOCARGAPARCIAL / RANGOACTUAL: 72 rangos, 12.921.999 folios, lost_folios 0
EN_USO / RANGOCARGAPARCIAL / RANGOANTERIOR: 31 rangos, 4.963.101 folios, lost_folios 4.618.228
POR_OCUPAR / RANGOSINUSO / RANGOANTERIOR: 140 rangos, 19.604.999 folios, lost_folios 19.604.999
POR_OCUPAR / RANGOSINUSO / RANGOFUTURO: 43 rangos, 5.360.000 folios, lost_folios 0
```

Resumen empresa extendido:

```txt
WARNING: 48 empresas, 3.538.844 documentos, 30.663.227 lost_folios
OK: 35 empresas, 380.644 documentos, 0 lost_folios
```

Resumen device extendido:

```txt
REVISION_DATOS: 31 devices, diferencia_solicitado_rango 59.175
PELIGRO: 36 devices
CRITICO: 10 devices
ALERTA: 9 devices
OK: 321 devices
```

## Observaciones

- La primera ejecucion fallo por nombre de base mal escrito (`suporte`); la base correcta es `soporte`.
- Se ajusto `lost_folios` para no contar rangos `AGOTADO`.
- Se ajusto el manejo de `NULL` en `folio_mayor` para que rangos anteriores sin uso cuenten correctamente cuando aplica.
- `CADUCADO_CANDIDATO` sigue siendo una clasificacion operativa, no una caducidad certificada por SII.

## Seguridad

No se ejecuto ningun script historico de `layoutExample`.

No se ejecuto ninguna accion contra `public`.


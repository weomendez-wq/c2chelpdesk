# Diseno folios y CAF

## Objetivo

Incorporar el dominio folios/CAF como bloque certificado despues de empresas, documentos y devices.

El foco inicial es lectura y cuadratura, no carga ni normalizacion:

```txt
CAF otorgados -> historial asignado -> folios disponibles -> documentos emitidos 2026
```

## Regla de seguridad

No se ejecuta nada contra `public`.

Las vistas y verificaciones de este bloque deben usar solo:

- `staging_public.caf`
- `staging_public.foliosdisponibles`
- `staging_public.historialasignacionfolios`
- `staging_public.empresa`
- `staging_public.tenant`
- `rr_gestion_soporte.documentos_2026_normalizados`

Las funciones historicas preservadas en `docs/referencias-funciones/` solo se usan como referencia de formulas.

## Vistas propuestas

### `rr_gestion_soporte.folios_caf_resumen`

Resumen de CAF por tenant, RUT y tipo de documento.

Campos esperados:

- `tenant_id`
- `tenant_name`
- `rut`
- `empresa_name`
- `document_type`
- `caf_count`
- `folios_otorgados`
- `primer_caf`
- `ultimo_caf`
- `folio_min`
- `folio_max`

Uso:

- Certificar cuantos CAF existen.
- Certificar total de folios otorgados.
- Separar totales por tipo de documento.

### `rr_gestion_soporte.folios_disponibles_resumen`

Resumen de folios disponibles por tenant, RUT y tipo de documento.

Campos esperados:

- `rangos_disponibles`
- `folios_disponibles`
- `nivel_alerta_disponibles`

Umbrales iniciales:

```txt
OK: mas de 30.000
WARNING: 10.001 a 30.000
URGENTE: 1 a 10.000
SIN_FOLIOS: 0 o sin registro
```

### `rr_gestion_soporte.folios_historial_resumen`

Resumen de cargas historicas por tenant, RUT, device y tipo de documento.

Campos esperados:

- `cargas_historial`
- `folios_entregados_por_rango`
- `folios_solicitados`
- `diferencia_solicitado_rango`
- `cuadratura_historial`

Uso:

- Detectar diferencias entre cantidad solicitada y rango realmente asignado.
- Identificar cargas por device.

### `rr_gestion_soporte.folios_control_resumen`

Vista de control para frontend y endpoints.

Combina:

- CAF otorgados.
- Folios disponibles.
- Historial asignado.
- Documentos emitidos 2026 por tipo de documento.

Alertas iniciales:

```txt
OK
WARNING
URGENTE
SIN_FOLIOS
REVISION_DATOS
```

## Criterios de alerta inicial

- `SIN_FOLIOS`: no existen folios disponibles para una combinacion con CAF.
- `URGENTE`: folios disponibles entre 1 y 10.000.
- `WARNING`: folios disponibles entre 10.001 y 30.000.
- `REVISION_DATOS`: diferencias entre folios solicitados y rango asignado, o documentos emitidos mayores que folios otorgados.
- `OK`: sin alerta detectada.

## Validacion esperada

Las verificaciones deben responder:

- Total CAF y folios otorgados.
- Total folios disponibles.
- Total cargas de historial.
- Total documentos emitidos 2026 usados para comparar.
- Top diferencias de historial.
- Alertas por nivel.

No se debe exponer el bloque en frontend si las verificaciones no cuadran o si falta una tabla local.

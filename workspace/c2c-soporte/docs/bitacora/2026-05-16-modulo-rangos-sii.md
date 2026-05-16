# Modulo Rangos SII

Fecha: 2026-05-16

## Objetivo

Iniciar la fase SII exponiendo rangos CAF clasificados de forma segura y solo lectura.

## Cambios realizados

- Backend:
  - Se agrego schema `folioRangesQuerySchema`.
  - Se agrego servicio `listFolioRanges`.
  - Se agrego endpoint `GET /api/support/control/folio-ranges`.
- Frontend:
  - Se agrego tipo `FolioRange`.
  - Se agrego servicio `getFolioRanges`.
  - Se reemplazo el placeholder de Rangos SII por cards y tabla paginada.
  - Se agrego filtro por estado operativo.

## Fuente de datos

```txt
rr_gestion_soporte.folios_rangos_clasificados_detalle
```

## Seguridad

- No se ejecuta nada contra `public`.
- No se ejecutan acciones SII.
- No se actualizan rangos.
- `CADUCADO_CANDIDATO` se muestra como candidato operativo, no como caducidad certificada por SII.

## Pendiente

- Exportacion controlada de rangos filtrados.
- Filtros por temporalidad y tipo documento en UI.
- Vista detalle de rango.
- Criterios finales para baja/gestion SII.

## Verificacion

```txt
npm run typecheck
npm run build
GET /api/support/control/folio-ranges?limit=5&offset=0
```

Resultado:

```txt
backend typecheck OK
frontend typecheck OK
frontend build OK
endpoint folio-ranges HTTP 200
```

Observacion:

La primera consulta del endpoint puede tardar varios segundos porque la vista cruza rangos CAF con documentos 2026. Si esta latencia se mantiene, se debe evaluar una agregacion local optimizada o vista materializada en `rr_gestion_soporte`, nunca en `public`.

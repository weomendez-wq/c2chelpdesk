# Bitacora - Certificacion SII / CAF operacional

Fecha: 2026-05-16

## Objetivo

Ejecutar el primer punto del plan SII / CAF operacional: certificar la base local antes de ampliar endpoints o frontend.

## Script

```txt
database/sql/36-certify-sii-caf-operational-base.sql
```

El script es de solo lectura y usa objetos locales `rr_gestion_soporte` y `staging_public`.

## Resultado general

- Objetos locales requeridos: OK.
- Ultimo refresh cache: `SUCCESS`.
- Duracion ultimo refresh registrado: `133732 ms`.
- Caches registradas:
  - `caf_vencimiento_cache`: 374.
  - `folios_control_resumen_cache`: 87.
  - `folios_rangos_clasificados_cache`: 374.
  - `folios_proyeccion_agotamiento_cache`: 87.
  - `alertas_operativas_cache`: 305.

## Totales relevantes

### DTE 33 - Factura electronica

- CAF total: 11.
- Folios otorgados: 6760.
- Alertas vencimiento CAF:
  - `URGENTE`: 1 CAF, 100 folios.
  - `OK`: 10 CAF, 6660 folios.
- Folios control:
  - `REVISION_DATOS`: 1 combinacion.
- Agotamiento:
  - `URGENTE`: 1 combinacion, 1765 folios disponibles.

### DTE 39 - Boleta electronica

- CAF total: 359.
- Folios otorgados: 53438999.
- Vencimiento CAF: `NO_APLICA`.
- Folios control:
  - `REVISION_DATOS`: 20 combinaciones.
  - `WARNING`: 6 combinaciones.
  - `OK`: 57 combinaciones.
- Agotamiento:
  - `WARNING`: 5 combinaciones.
  - `SIN_BASE_ESTIMACION`: 16 combinaciones.

### DTE 41 - Boleta exenta electronica

- CAF total: 4.
- Folios otorgados: 163000.
- Vencimiento CAF: `NO_APLICA`.
- Folios control:
  - `WARNING`: 2 combinaciones.
  - `OK`: 1 combinacion.
- Agotamiento:
  - `WARNING`: 2 combinaciones.
  - `OK`: 1 combinacion.

## Hallazgos

### Configuracion DTE 33

La configuracion local actual muestra:

```txt
document_type = 33
vigencia_meses = 5
warning_dias = 30
aplica_vencimiento = true
```

El criterio funcional definido para facturas electronicas `33` era 6 meses. Esto afecta el calculo de vencimiento y puede adelantar alertas.

Decision pendiente:

- Confirmar si se corrige a 6 meses desde el mantenedor DTE/CAF.
- Despues de corregir, ejecutar refresh manual de caches para recalcular alertas.

Decision ejecutada:

- Se actualizo `rr_gestion_soporte.caf_vencimiento_config` por API auditada.
- `document_type = 33` quedo con `vigencia_meses = 6`.
- Auditoria local registrada en `rr_gestion_soporte.config_change_log`:
  - `config_scope = DTE_CAF_CONFIG`
  - `config_id = 1`
  - `requested_by = codex-sii-caf-fase`
- Se ejecuto refresh manual de caches.
- Refresh registrado:
  - `refresh_id = 7`
  - `status = SUCCESS`
  - `duration_ms = 160388`
  - `requested_by = codex-sii-caf-fase`
- La recertificacion confirma que DTE `33` quedo en 6 meses.
- Las cantidades de alertas no cambiaron, pero la regla local y la cache quedaron consistentes.

### Tiempo de certificacion

La primera ejecucion demoro cerca de 88 segundos porque el cierre consultaba `rr_gestion_soporte.folios_resumen_empresa_extendido`, que es una vista extendida pesada.

Decision aplicada:

- El script se ajusto para que el top de empresas salga desde `rr_gestion_soporte.alertas_operativas_cache`.
- La vista extendida queda para analisis puntual, no para certificacion base.

### Segunda ejecucion

Despues del ajuste, la certificacion bajo a cerca de 27 segundos. Aun no es ideal para uso frecuente.

Siguiente mejora recomendada:

- Separar `documentos_sin_caf_resumen` como verificacion extendida o crear cache local para ese resumen.
- Mantener la certificacion base solo sobre caches para que responda en pocos segundos.

Decision aplicada:

- La certificacion base `36-certify-sii-caf-operational-base.sql` queda enfocada en caches locales.
- La revision de documentos sin CAF se separa a `37-certify-sii-caf-extended-documents.sql`.

Validacion posterior:

- Certificacion base sobre caches: menos de 1 segundo.
- Certificacion extendida de documentos sin CAF: cerca de 55 segundos.
- Resultado extendido: `0` documentos sin CAF para DTE `33`, `39` y `41`.

Decision:

- El flujo normal debe usar `36-certify-sii-caf-operational-base.sql`.
- `37-certify-sii-caf-extended-documents.sql` queda para investigacion puntual, no para carga inicial de UI.

## Decision de avance

Antes de implementar endpoints nuevos, conviene resolver la configuracion DTE `33` y refrescar caches. Luego se puede continuar con el punto 2 del plan: consulta compacta SII / CAF por empresa.

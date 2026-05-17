# Plan SII / CAF operacional

Fecha: 2026-05-16

## Objetivo

Ordenar la siguiente fase del proyecto C2C Helpdesk para cerrar el modulo SII / CAF sin duplicar logica, manteniendo el foco en soporte operativo, rendimiento y seguridad de datos.

La fase debe transformar la informacion CAF, folios, vencimientos y rangos SII en una vista simple para soporte:

- Que empresa tiene riesgo.
- Que tipo DTE esta afectado.
- Que CAF o rango genera la alerta.
- Cuantos folios quedan.
- Cuando vence o se estima que se agota.
- Que decision debe tomar soporte.

## Regla de seguridad

- No ejecutar cambios sobre `public`.
- No ejecutar `DROP`, `TRUNCATE`, `DELETE`, `UPDATE`, `INSERT`, `LOCK`, `GRANT`, `REVOKE` ni mantenimiento sobre origen productivo.
- Toda escritura permitida debe ser local y dentro de `rr_gestion_soporte`.
- Las tablas `staging_public` son fuente local migrada, no mantenedor editable.
- Los scripts heredados o de referencia en `layoutExample` y `docs/referencias-funciones` no se ejecutan sin normalizacion previa.

## Estado actual confirmado

Ya existen piezas base que deben reutilizarse:

- Configuracion DTE/CAF editable:
  - `rr_gestion_soporte.caf_vencimiento_config`
- Umbrales de alerta editables:
  - `rr_gestion_soporte.folios_alerta_config`
- Auditoria local:
  - `rr_gestion_soporte.config_change_log`
- Vencimiento CAF desde XML:
  - `rr_gestion_soporte.caf_vencimiento_resumen`
  - `rr_gestion_soporte.caf_vencimiento_cache`
- Rangos SII clasificados:
  - `rr_gestion_soporte.folios_rangos_clasificados_detalle`
  - `rr_gestion_soporte.folios_rangos_clasificados_cache`
- Control folios:
  - `rr_gestion_soporte.folios_control_resumen`
  - `rr_gestion_soporte.folios_control_resumen_cache`
- Proyeccion de agotamiento:
  - `rr_gestion_soporte.folios_proyeccion_agotamiento`
  - `rr_gestion_soporte.folios_proyeccion_agotamiento_cache`
- Alertas operativas:
  - `rr_gestion_soporte.alertas_operativas_cache`
- Refresco manual:
  - `GET /api/support/control/cache-status`
  - `POST /api/support/control/cache-refresh`

## Tipos DTE vigentes para esta etapa

El cliente opera actualmente:

- `33`: Factura electronica.
- `39`: Boleta electronica.
- `41`: Boleta exenta electronica.

Reglas iniciales:

- DTE `33` tiene vencimiento operacional CAF de 6 meses.
- DTE `39` y `41` no tienen vencimiento CAF operativo inicial, pero si deben controlar folios disponibles, rangos, uso y agotamiento.
- El tag `FA` desde `xml_caf` se usa como fecha de autorizacion del CAF.

## Orden de trabajo

### 1. Certificar base SII / CAF local

Objetivo:

Confirmar que las piezas locales ya creadas tienen datos y cuadran en conteos generales.

Validaciones:

- Total CAF por tipo DTE.
- Total folios otorgados por tipo DTE.
- Total rangos clasificados.
- Total alertas CAF vencimiento.
- Total alertas folios.
- Ultimo refresh cache.

Decision si aparece hallazgo:

- Si falta una tabla local: crear o ejecutar solo el script local correspondiente.
- Si falta data en `staging_public`: detener y revisar copia local, no tocar origen.
- Si los conteos no cuadran: documentar diferencia antes de modificar querys.

### 2. Definir consulta compacta por empresa

Objetivo:

Crear una lectura unica y liviana para que el usuario seleccione una empresa por tenant o RUT y vea el estado SII / CAF sin abrir varias tablas.

Campos esperados:

- `tenant_id`
- `tenant_name`
- `rut`
- `empresa_name`
- `document_type`
- nombre DTE
- total CAF
- total rangos
- folios otorgados
- folios usados
- folios disponibles
- documentos emitidos 2026
- primera emision
- ultima emision
- dias sin emitir
- estado folios
- estado agotamiento
- estado vencimiento CAF
- alerta principal

Decision si aparece hallazgo:

- Si la query es lenta: leer desde caches, no desde vistas pesadas.
- Si falta un campo: agregarlo a una cache local o resolverlo en endpoint, no recalcular desde documentos por pantalla.
- Si hay inconsistencia de datos: mostrar `REVISION_DATOS` y documentar caso.

### 3. Definir detalle CAF / rangos por empresa

Objetivo:

Mostrar los rangos CAF de una empresa y tipo DTE con estado operacional.

Campos esperados:

- CAF serial.
- folio inicial.
- folio final.
- total rango.
- total ocupado.
- total disponible estimado.
- primer folio emitido.
- ultimo folio emitido.
- fecha ultima emision.
- fecha autorizacion CAF.
- fecha vencimiento CAF.
- dias para vencer.
- estado rango.
- clasificacion temporal.
- folios perdidos o caducados candidatos.

Decision si aparece hallazgo:

- Si el calculo por rango demora: usar `folios_rangos_clasificados_cache`.
- Si hay documentos fuera de CAF: mostrar alerta y relacionar con `documentos_sin_caf_resumen`.
- Si hay rangos caducados candidatos: no deshabilitar ni modificar nada, solo preparar exportacion futura.

### 4. Definir resumen de alertas SII / CAF

Objetivo:

Unificar las alertas relevantes para soporte.

Fuentes locales:

- `alertas_operativas_cache`
- `caf_vencimiento_cache`
- `folios_control_resumen_cache`
- `folios_proyeccion_agotamiento_cache`
- `folios_rangos_clasificados_cache`

Alertas esperadas:

- CAF factura `33` vencido o por vencer.
- Folios bajo minimo.
- Proyeccion de agotamiento.
- Rango sin uso antiguo.
- Rango anterior con folios no usados.
- Documentos sin CAF.
- Empresa sin emision reciente.
- Device sin emision reciente.

Decision si aparece hallazgo:

- Si hay demasiadas alertas: agrupar por empresa y severidad.
- Si hay ruido operativo: ajustar umbrales locales, no cambiar datos origen.
- Si faltan reglas: agregar configuracion local editable antes de tocar SQL complejo.

### 5. Ajustar endpoints backend

Objetivo:

Exponer la informacion ya optimizada sin recalcular datos pesados en cada request.

Endpoints sugeridos:

```txt
GET /api/support/control/sii-caf/summary
GET /api/support/control/sii-caf/companies
GET /api/support/control/sii-caf/companies/:tenantId/:rut
GET /api/support/control/sii-caf/companies/:tenantId/:rut/ranges
GET /api/support/control/sii-caf/alerts
```

Reglas:

- Usar caches por defecto.
- Paginacion obligatoria en rangos y alertas.
- `includeTotal=false` por defecto en listados pesados.
- Filtros por tenant, RUT, tipo DTE, severidad y estado.

Decision si aparece hallazgo:

- Si un endpoint supera el tiempo aceptable: medir query, revisar indices y mover calculo a cache.
- Si el frontend necesita muchos endpoints simultaneos: crear resumen compacto por empresa.
- Si una metrica no es confiable: mostrarla como pendiente y documentar causa.

### 6. Integrar frontend de forma incremental

Objetivo:

Mejorar el layout sin sobrecargar al usuario ni bloquear la pantalla.

Orden UI:

1. Selector tenant/RUT.
2. Cards compactas de estado general.
3. Semaforo SII / CAF por tipo DTE.
4. Tabla de rangos CAF paginada.
5. Alertas agrupadas por severidad.
6. Detalle tecnico desplegable solo cuando el usuario lo necesite.

Reglas:

- Mostrar spinner por accion.
- No cargar detalle pesado hasta que exista empresa seleccionada.
- Formatear numeros grandes.
- Evitar `SELECT` amplios solo para llenar cards visuales.

Decision si aparece hallazgo:

- Si la pantalla carga lento: cargar resumen primero y detalle bajo demanda.
- Si hay demasiada informacion: ocultar detalle en panel expandible.
- Si soporte necesita accion: crear mantenedor o proceso separado, no mezclarlo con dashboard.

### 7. Proceso manual de refresco y validacion

Objetivo:

Que soporte pueda recalcular caches cuando cambien datos locales o umbrales.

Validaciones despues de refresh:

- Duracion del proceso.
- Total alertas generadas.
- Total rangos cacheados.
- Total CAF por vencer.
- Fecha/hora del ultimo refresh.
- Estado `SUCCESS` o `ERROR`.

Decision si aparece hallazgo:

- Si refresh tarda demasiado: dividir proceso por cache.
- Si falla una cache: registrar error y mantener datos anteriores visibles.
- Si cambia una regla editable: exigir refresh manual antes de considerar alertas definitivas.

## Entregables de esta fase

- Documento de orden operativo SII / CAF.
- Querys de certificacion base.
- Endpoint de resumen SII / CAF por empresa.
- Endpoint de detalle rangos CAF por empresa.
- Integracion frontend incremental.
- Bitacora con hallazgos y decisiones.
- Commit separado por documentacion y por implementacion cuando corresponda.

## Criterio para cerrar fase

La fase se considera lista cuando:

- Una empresa puede buscarse por tenant o RUT.
- Se ven sus totales CAF / folios / documentos.
- Se identifican alertas principales por tipo DTE.
- DTE `33` muestra vencimiento CAF desde `xml_caf`.
- Rangos SII se consultan desde cache paginada.
- No existen consultas lentas en carga inicial del frontend.
- Todo cambio editable queda auditado.

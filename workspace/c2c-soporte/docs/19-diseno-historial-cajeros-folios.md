# Diseno historial, cajeros y proyeccion de folios

## Objetivo

Extender la torre de control con:

- Metricas de cajeros/devices.
- Totales historicos de anos anteriores sin copiar toda la data.
- Primer y ultimo folio emitido por cajero.
- Ultimo folio emitido por cliente.
- Estimacion de agotamiento de folios disponibles.
- Rangos de folios caducados, actuales y por ocupar.
- Alertas con umbrales configurables.

## Regla critica

No ejecutar contra `dte.public` ninguna accion de escritura, eliminacion, actualizacion, insercion, truncado, bloqueo, permisos, DDL, mantenimiento destructivo ni funciones con efectos laterales.

Para origen `dte.public`, la unica operacion permitida para este bloque es extraccion agregada de solo lectura, idealmente en sesion read-only y con `statement_timeout`.

## Principio de datos

No se copiara la data historica completa de anos anteriores.

Se copiara solo un resumen anual agregado suficiente para:

- Comparar consumo historico contra consumo actual.
- Estimar tendencia.
- Calcular primer y ultimo folio historico.
- Conservar evidencia anual para auditoria operativa.

## Fuente historica propuesta

Origen de solo lectura:

```txt
dte.public.documentos
```

Extraccion agregada por:

- `anio`
- `tenant_id`
- `rut`
- `device_id`
- `tipodocumento`

Metricas:

- `documentos_emitidos`
- `primer_folio_emitido`
- `ultimo_folio_emitido`
- `primera_emision`
- `ultima_emision`
- `valor_total_documentos`

## Destino local propuesto

Tabla local controlada:

```txt
rr_gestion_soporte.documentos_historial_anual_resumen
```

Esta tabla vive solo en la base local `soporte`. No modifica origen.

Uso esperado:

- Cargar una vez al ano o cuando soporte decida refrescar el historico.
- Mantener un registro compacto por ano, empresa, device y tipo documento.
- Servir como base para estimaciones y comparaciones.

## Cajeros/devices

La metrica de cajeros se debe construir desde:

- `staging_public.device`
- `staging_public.deviceconfiggroup`
- `staging_public.tenant`
- `rr_gestion_soporte.documentos_2026_normalizados`
- `rr_gestion_soporte.documentos_historial_anual_resumen`

Vistas propuestas:

```txt
rr_gestion_soporte.cajero_emision_mensual
rr_gestion_soporte.cajero_control_resumen
rr_gestion_soporte.cajero_ranking_resumen
```

Metricas por cajero:

- Estado tecnico (`active`, `disabled`, `suspended`).
- Estado operacional (`NORMAL`, `OBSERVACION`, `WARNING`, `ALERTA`, `CRITICO`, `PELIGRO`, `SIN_EMISION`).
- Primera emision.
- Ultima emision.
- Dias sin emision.
- Documentos emitidos por mes.
- Promedio diario reciente.
- Promedio mensual reciente.
- Ranking mensual.
- Ranking por tenant.
- Primer folio emitido por cajero.
- Ultimo folio emitido por cajero.

## Folios y agotamiento

La estimacion de agotamiento debe combinar:

- Folios disponibles actuales.
- Consumo real 2026.
- Consumo historico anual agregado.
- Promedio diario configurable.
- Umbrales por tipo documento.

Vista propuesta:

```txt
rr_gestion_soporte.folios_proyeccion_agotamiento
```

Metricas:

- `folios_disponibles`
- `promedio_diario_30d`
- `promedio_diario_90d`
- `promedio_diario_historico`
- `dias_hasta_agotar_30d`
- `dias_hasta_agotar_90d`
- `dias_hasta_agotar_historico`
- `fecha_estimada_agotamiento`
- `nivel_alerta_agotamiento`

Regla base:

```txt
dias_hasta_agotar = folios_disponibles / promedio_diario
```

Si no hay promedio diario confiable, la alerta debe quedar como `SIN_BASE_ESTIMACION`.

## Umbrales configurables

Se propone una tabla local:

```txt
rr_gestion_soporte.folios_alerta_config
```

Campos:

- `tenant_id` opcional.
- `rut` opcional.
- `document_type` opcional.
- `minimo_folios_warning`.
- `minimo_folios_urgente`.
- `dias_agotamiento_warning`.
- `dias_agotamiento_urgente`.
- `dias_sin_emision_warning`.
- `dias_sin_emision_urgente`.
- `activo`.

Regla:

- Si existe configuracion por empresa/tipo documento, usar esa.
- Si no existe, usar configuracion global.

## Rangos caducados, actuales y por ocupar

Objetivo:

- Identificar rangos CAF completos por empresa.
- Separar rangos sin uso, en uso y potencialmente caducados.
- Guardar rangos caducados por empresa para facilitar gestion posterior en SII.

Vista propuesta:

```txt
rr_gestion_soporte.folios_rangos_estado
```

Estados propuestos:

```txt
POR_OCUPAR
EN_USO
AGOTADO
CADUCADO_CANDIDATO
REVISION_DATOS
```

Criterio inicial:

- `POR_OCUPAR`: rango CAF sin documentos emitidos dentro del rango.
- `EN_USO`: rango CAF con uso parcial y folios disponibles.
- `AGOTADO`: todos los folios del rango aparecen consumidos o el ultimo folio emitido alcanzo `folio_fin`.
- `CADUCADO_CANDIDATO`: rango antiguo sin uso reciente o con fecha de autorizacion caducada cuando ese dato exista.
- `REVISION_DATOS`: inconsistencia entre CAF, historial, disponibles y documentos.

Dato pendiente:

La tabla `staging_public.caf` visible actualmente contiene `created_at`, `updated_at`, `cafserial`, `folio_ini` y `folio_fin`, pero no se ha certificado una fecha explicita de vencimiento CAF. Puede estar dentro de `xml_caf`, por lo que se debe analizar el XML antes de declarar caducidad final.

## Ejecucion anual manual

Este proceso debe quedar programable, pero la ejecucion debe ser manual mediante boton o comando controlado.

Flujo propuesto:

```txt
1. Usuario soporte/admin abre pantalla de mantenimiento historico.
2. Selecciona ano a resumir.
3. Sistema muestra EXPLAIN/estimacion o prevalidacion.
4. Usuario ejecuta extraccion agregada.
5. Se guarda solo resumen anual en rr_gestion_soporte.
6. Se registra auditoria local del proceso.
7. Se recalculan vistas de estimacion.
```

## Objetos locales futuros

Tablas:

```txt
rr_gestion_soporte.documentos_historial_anual_resumen
rr_gestion_soporte.folios_alerta_config
rr_gestion_soporte.proceso_historial_anual_log
```

Vistas:

```txt
rr_gestion_soporte.cajero_emision_mensual
rr_gestion_soporte.cajero_control_resumen
rr_gestion_soporte.folios_proyeccion_agotamiento
rr_gestion_soporte.folios_rangos_estado
```

Endpoints:

```txt
GET /api/support/control/cashiers
GET /api/support/control/folios/projection
GET /api/support/control/folios/ranges
POST /api/support/admin/history/explain
POST /api/support/admin/history/run
```

Los endpoints `POST` deben requerir autorizacion y confirmacion explicita. No deben tocar `public`; solo leen agregados desde origen y escriben resumen local.

## Riesgos y controles

| Riesgo | Control |
| --- | --- |
| Cargar demasiada data historica | Solo resumen anual agregado |
| Bloquear origen `public` | Sesion read-only, timeout y agregacion por ano |
| Estimacion erronea por baja actividad | Marcar `SIN_BASE_ESTIMACION` |
| Declarar folios caducados sin fecha real | Usar `CADUCADO_CANDIDATO` hasta analizar `xml_caf` |
| Duplicar resumen anual | Clave unica por ano, tenant, rut, device y tipo documento en local |
| Ejecutar proceso automatico sin control | Boton manual con auditoria |

## Proxima decision

Antes de implementar carga anual, se debe confirmar:

- Anos historicos requeridos.
- Si `fechaemision` historica mantiene formato `YYYY-MM-DD`.
- Si `xml_caf` contiene fecha de autorizacion/vencimiento util para caducidad.
- Umbrales globales iniciales para folios y cajeros.

# Mapa de modulos C2C Helpdesk

Fecha: 2026-05-16

## Objetivo

Definir los modulos principales de `c2c-helpdesk` antes de continuar con mantenedores, diseno y pruebas.

La meta es que el usuario de soporte navegue desde una vista global hacia datos accionables, sin tener que conocer las tablas internas.

## Principio de producto

El sistema debe mostrar informacion simplificada, pero trazable:

```txt
Modulo -> endpoint -> vista rr_gestion_soporte -> origen local
```

No se debe exponer directamente `staging_public` al frontend. El frontend debe consumir endpoints controlados del backend.

## Shell principal

### Header

El header debe centralizar el contexto operativo.

Elementos propuestos:

- Selector global de empresa, tenant o RUT.
- Estado de conexion backend.
- Estado de conexion base local.
- Ultima actualizacion visible.
- Boton de refrescar.
- Indicador de filtros activos.
- Acceso rapido a alertas.

Regla:

El selector global no debe reemplazar filtros por modulo. Debe establecer el contexto base para toda la pantalla.

### Sidebar

Orden propuesto:

```txt
1. Torre de Control
2. Empresas
3. Cajeros / Devices
4. Documentos
5. Folios / CAF
6. Rangos SII
7. Alertas
8. Mesa de Ayuda
9. Procesos
10. Mantenedores
11. Configuracion
```

## Modulos

### 1. Torre de Control

Proposito:

Vista ejecutiva para priorizar problemas.

Debe responder:

- Que empresas estan en riesgo.
- Donde faltan folios.
- Que cajeros dejaron de emitir.
- Que datos no cuadran.
- Que requiere accion urgente.

Vista local propuesta:

```txt
rr_gestion_soporte.torre_control_empresa_resumen
```

Endpoint propuesto:

```txt
GET /api/support/control/global
```

Componentes:

- Cards globales.
- Tabla priorizada.
- Panel de alertas.
- Filtro por tenant/RUT/tipo documento.

### 2. Empresas

Proposito:

Maestro operacional de empresas configuradas.

Debe responder:

- Cuantas empresas existen.
- Cuales estan activas o inactivas.
- Cuales emiten.
- Cuales no emiten.
- Que tenant corresponde a cada RUT.

Vista actual:

```txt
rr_gestion_soporte.empresa_control_resumen
```

Endpoint actual/propuesto:

```txt
GET /api/support/control/companies
GET /api/support/control/company/:tenantId
```

Componentes:

- Tabla paginada.
- Cards de cantidad, activas, inactivas y sin emision.
- Detalle compacto por empresa.

### 3. Cajeros / Devices

Proposito:

Monitorear estado tecnico y actividad real de cajeros.

Debe responder:

- Cuantos devices tiene una empresa.
- Cuales estan activos/inactivos.
- Cuales llevan dias sin emitir.
- Primer y ultimo folio emitido por cajero.
- Produccion mensual por cajero.

Vistas actuales:

```txt
rr_gestion_soporte.device_control_resumen
rr_gestion_soporte.cajero_control_resumen
rr_gestion_soporte.cajero_emision_mensual
rr_gestion_soporte.folios_resumen_device_extendido
```

Endpoints propuestos:

```txt
GET /api/support/control/devices
GET /api/support/control/cashiers
GET /api/support/control/cashiers/monthly
```

Componentes:

- Tabla de devices.
- Estado operacional.
- Ranking mensual.
- Detalle por cajero.

### 4. Documentos

Proposito:

Mostrar emision documental consolidada y tendencias.

Debe responder:

- Total emitido en el ano.
- Total mensual.
- Total por empresa.
- Total por device.
- Documentos que no calzan con CAF.

Vistas actuales:

```txt
rr_gestion_soporte.documentos_2026_normalizados
rr_gestion_soporte.documentos_2026_mensual
rr_gestion_soporte.documentos_2026_device_mensual
rr_gestion_soporte.documentos_sin_caf_resumen
```

Endpoints actuales/propuestos:

```txt
GET /api/support/control/documents-summary
GET /api/support/control/documents-monthly
GET /api/support/control/documents-without-caf
```

Componentes:

- Grafico mensual simple.
- Cards de total anual, empresas, devices y documentos sin CAF.
- Tabla con filtros por fecha, tipo documento y empresa.

### 5. Folios / CAF

Proposito:

Controlar CAF, folios otorgados, disponibles, usados y proyectados.

Debe responder:

- Cuantos CAF existen.
- Cuantos folios fueron otorgados.
- Cuantos quedan disponibles.
- Cuando se podrian agotar.
- Que datos no cuadran.

Vistas actuales:

```txt
rr_gestion_soporte.folios_caf_resumen
rr_gestion_soporte.folios_disponibles_resumen
rr_gestion_soporte.folios_historial_resumen
rr_gestion_soporte.folios_control_resumen
rr_gestion_soporte.folios_proyeccion_agotamiento
```

Endpoints actuales/propuestos:

```txt
GET /api/support/control/folios
GET /api/support/control/folios/projection
```

Componentes:

- Cards CAF, otorgados, disponibles, alertas.
- Tabla por empresa y tipo documento.
- Detalle por historial de asignacion.

### 6. Rangos SII

Proposito:

Preparar gestion de rangos usados, sin uso, anteriores, futuros y candidatos.

Debe responder:

- Que rangos estan agotados.
- Que rangos estan en uso.
- Que rangos son futuros.
- Que rangos anteriores tienen folios no utilizados.
- Que rangos son candidatos a revision o baja posterior.
- Que CAF tipo `33` estan vencidos o por vencer segun fecha `FA` del XML CAF y reglas locales de `rr_gestion_soporte.caf_vencimiento_config`.

Vistas actuales:

```txt
rr_gestion_soporte.folios_rangos_estado
rr_gestion_soporte.folios_rangos_clasificados_detalle
```

Endpoint implementado:

```txt
GET /api/support/control/folio-ranges
```

Componentes:

- Tabla de rangos.
- Filtros por estado operativo, temporalidad, empresa y tipo documento.
- Exportacion controlada.

Nota:

`CADUCADO_CANDIDATO` es una clasificacion operacional. No debe presentarse como caducidad SII confirmada.

Estado implementacion:

- Endpoint backend de solo lectura.
- Filtro por empresa seleccionada.
- Filtro por estado operativo.
- Cards de rangos visibles, candidatos, anteriores y lost folios.
- Indicadores de vencimiento CAF para facturas electronicas tipo `33`, con vigencia y warning parametrizados localmente.
- Tabla paginada de rangos.
- Exportacion queda pendiente.

### 7. Alertas

Estado:

```txt
Implementacion inicial disponible
```

Proposito:

Centralizar riesgos detectados por el sistema.

Debe responder:

- Que requiere revision de datos.
- Que esta en warning.
- Que esta urgente.
- Que no tiene base de estimacion.

Fuentes:

```txt
rr_gestion_soporte.empresa_control_resumen
rr_gestion_soporte.folios_control_resumen
rr_gestion_soporte.folios_proyeccion_agotamiento
rr_gestion_soporte.device_control_resumen
rr_gestion_soporte.caf_vencimiento_resumen
```

Endpoint:

```txt
GET /api/support/control/alerts
```

Alcance inicial:

- Solo lectura sobre objetos locales `rr_gestion_soporte`.
- No consulta `rr_gestion_soporte.folios_rangos_clasificados_detalle` en la primera version, porque esa vista puede tardar varios segundos y ya queda cubierta por el modulo Rangos SII.
- Consolidar alertas de empresas sin emision, devices con problemas de emision/consistencia, folios con diferencias o falta de stock, y proyeccion de agotamiento.
- Incluir vencimiento CAF tipo `33` como alerta `CAF_VENCIMIENTO`.
- Filtros por severidad, fuente, tenant, RUT y busqueda.

Componentes:

- Bandeja de alertas.
- Filtro por severidad y fuente.
- Acceso al detalle de empresa/device/rango.

### 8. Mesa de Ayuda

Proposito:

Gestionar casos de soporte a partir de alertas, empresas, devices, CAF, rangos o solicitudes manuales.

Debe responder:

- Que tickets estan abiertos.
- Que tickets son urgentes.
- Que tickets dependen del cliente.
- Que tickets dependen del equipo interno.
- Que tickets estan relacionados con una alerta operacional.
- Que historial de gestion existe para cada caso.

Tablas propuestas:

```txt
rr_gestion_soporte.helpdesk_ticket
rr_gestion_soporte.helpdesk_ticket_event
rr_gestion_soporte.helpdesk_ticket_link
```

Endpoints propuestos:

```txt
GET  /api/support/helpdesk/tickets
GET  /api/support/helpdesk/tickets/:ticketId
POST /api/support/helpdesk/tickets
PATCH /api/support/helpdesk/tickets/:ticketId/status
POST /api/support/helpdesk/tickets/:ticketId/events
POST /api/support/helpdesk/tickets/from-alert
```

Componentes:

- Bandeja de tickets.
- Detalle de ticket.
- Timeline de gestion.
- Selector de estado y prioridad.
- Vinculo a empresa, device, CAF, rango o alerta.

Regla:

La mesa de ayuda no modifica datos origen. Solo registra gestion de soporte en tablas locales `rr_gestion_soporte`.

### 9. Procesos

Proposito:

Mostrar ejecuciones manuales, historial anual y validaciones.

Vistas/tablas actuales:

```txt
rr_gestion_soporte.proceso_historial_anual_log
```

Objetos futuros:

```txt
rr_gestion_soporte.folios_proceso_log
rr_gestion_soporte.folios_validacion_log
```

Endpoint propuesto:

```txt
GET /api/support/processes/history
```

Componentes:

- Tabla de ejecuciones.
- Estado del proceso.
- Resultado y errores.

### 10. Mantenedores

Proposito:

Administrar datos locales controlados del producto, no datos de origen.

Primeros mantenedores:

```txt
Tipos DTE
Umbrales de alerta
Contactos soporte
Parametros de procesos
```

Regla:

Los primeros mantenedores editables deben modificar solo tablas locales `rr_gestion_soporte`.

### 11. Configuracion

Proposito:

Parametros tecnicos y operativos.

Debe incluir:

- Base configurada.
- Estado backend.
- Version frontend/backend.
- Reglas de seguridad activas.
- Modo lectura/origen.

## Orden de implementacion recomendado

1. Shell con header y sidebar.
2. Torre de Control con cards globales.
3. Empresas como maestro principal.
4. Cajeros / Devices.
5. Folios / CAF.
6. Rangos SII.
7. Alertas.
8. Mantenedores locales.
9. Procesos.
10. Configuracion.

## Criterio de avance

Un modulo esta listo cuando:

- Tiene vista o consulta local definida.
- Tiene endpoint backend.
- Tiene tabla/cards frontend.
- Tiene loading, error y empty state.
- Tiene filtros esperados.
- Tiene validacion documentada.

# Plan de diseno y pruebas C2C Helpdesk

Fecha: 2026-05-16

## Objetivo

Definir como pasaremos desde vistas y querys hacia una herramienta usable por soporte.

El foco es construir una interfaz profesional, compacta y accionable.

## Principios de diseno

- La pantalla inicial debe ser operativa, no una portada.
- El usuario debe poder partir desde una empresa o desde una alerta.
- El diseno debe quedar preparado para integrar una mesa de ayuda con gestion de tickets.
- Las alertas actuales deben poder evolucionar a casos/tickets sin rehacer el layout principal.
- Los numeros grandes deben estar en cards.
- Los detalles deben estar en tablas compactas.
- Las acciones deben estar cerca del dato que afectan.
- Los colores deben indicar estado, no decorar.
- Toda accion lenta debe tener spinner o loading visible.
- Toda tabla debe tener paginacion o limite.

## Layout base

### AppShell

Componente contenedor principal.

Responsabilidades:

- Renderizar sidebar.
- Renderizar header.
- Renderizar area de modulo.
- Mantener layout estable.

### Sidebar

Responsabilidades:

- Navegacion por modulo.
- Mostrar modulo activo.
- Mantener orden definido en `21-mapa-modulos-c2c-helpdesk.md`.

### Header

Responsabilidades:

- Selector global tenant/RUT/empresa.
- Boton refrescar.
- Estado conexion.
- Ultima actualizacion.
- Resumen corto de alertas.

### ModuleHeader

Responsabilidades:

- Titulo del modulo.
- Descripcion corta.
- Acciones principales.
- Filtros rapidos.

## Componentes base

### Ya existentes o rescatados

```txt
TenantSelector
MetricCard
PaginationBar
DataTable
LoadingIndicator
```

### A construir

```txt
AppShell
Sidebar
Topbar
StatusBadge
FilterBar
LoadingOverlay
EmptyState
ErrorState
AlertPanel
DetailDrawer
ExportButton
ThresholdEditor
TicketInbox
TicketDetail
TicketTimeline
TicketStatusBadge
```

## Flujos principales

### Flujo 1: soporte revisa estado global

1. Entra a Torre de Control.
2. Ve cards globales.
3. Revisa alertas priorizadas.
4. Selecciona empresa con alerta.
5. Abre detalle.
6. Navega a folios, cajeros o documentos filtrados.

### Flujo 2: soporte busca empresa especifica

1. Usa selector global.
2. Selecciona tenant/RUT.
3. Ve resumen compacto.
4. Revisa devices, documentos, folios y rangos.
5. Exporta si necesita respaldo.

### Flujo 3: soporte revisa folios

1. Abre Folios / CAF.
2. Filtra por empresa o alerta.
3. Revisa CAF cargados, folios disponibles y proyeccion.
4. Si hay problema, abre Rangos SII.
5. Exporta rangos candidatos.

### Flujo 4: soporte ajusta umbrales

1. Abre Mantenedores.
2. Entra a Umbrales de alerta.
3. Crea o edita regla local.
4. Confirma cambios.
5. Sistema registra auditoria.
6. Torre de Control refleja nueva clasificacion.

### Flujo 5: soporte gestiona ticket futuro

1. Entra a Mesa de Ayuda.
2. Revisa bandeja de tickets por prioridad.
3. Abre ticket asociado a empresa, device, folio o alerta.
4. Revisa timeline de gestion y evidencias.
5. Cambia estado del ticket.
6. Registra observacion o accion realizada.
7. Vuelve al contexto operativo de la empresa.

## Pruebas funcionales manuales

### Base

- Backend responde `/api/health`.
- Frontend carga sin errores de consola.
- Proxy frontend responde contra backend.
- Selector global muestra empresas.

### Empresas

- Total de empresas coincide con endpoint.
- Activas + inactivas cuadran con total.
- Busqueda por RUT filtra correctamente.
- Seleccion de empresa actualiza los demas bloques.

### Cajeros / Devices

- Total devices coincide con tabla.
- Activos + inactivos cuadran con total.
- Estados operacionales se muestran con badge.
- Dias sin emision se ordena correctamente.

### Documentos

- Total anual coincide con query validada.
- Grafico mensual coincide con `documentos_2026_mensual`.
- Filtro por empresa cambia totales.
- Documentos sin CAF muestra cero o alerta segun vista.

### Folios / CAF

- Total CAF coincide con `folios_caf_resumen`.
- Folios otorgados coincide con suma de rangos CAF.
- Folios disponibles coincide con `folios_disponibles_resumen`.
- Alertas coinciden con `folios_control_resumen`.

### Rangos

- Estados de rangos coinciden con verificacion.
- `CADUCADO_CANDIDATO` aparece como candidato, no como certeza SII.
- Exportacion respeta filtros.

### Mantenedores

- Solo los mantenedores locales permiten editar.
- Guardar umbral invalido muestra error.
- Guardar umbral valido actualiza la tabla local.
- Cambios quedan auditados.

### Mesa de ayuda futura

- Un ticket puede vincularse a tenant/RUT.
- Un ticket puede vincularse a una alerta operacional.
- Un ticket puede vincularse a device, CAF, rango o tipo DTE.
- El estado del ticket no debe modificar datos origen.
- Toda accion debe quedar en timeline.
- La primera bandeja puede usar alertas actuales como candidatos antes de crear persistencia.
- La primera version permitira tickets manuales.
- La primera version usara catalogo local de responsables.
- Los adjuntos quedan para una fase posterior.

## Pruebas tecnicas recomendadas

### Backend

- Typecheck.
- Tests de validacion Zod.
- Tests de SQL safety.
- Tests de endpoints con mocks o DB local.

### Frontend

- Typecheck.
- Build.
- Prueba manual con navegador.
- Revision de consola.
- Verificacion responsive minima.

### SQL

- Cada script create debe tener script verify.
- Toda query nueva debe usar `rr_gestion_soporte` o `staging_public`.
- Si una query tarda demasiado, documentar y evaluar optimizacion local.

## Criterio para pasar a implementacion

Antes de tocar frontend:

- Mapa de modulos aprobado.
- Primer set de endpoints definido.
- Componentes base priorizados.
- Mantenedores iniciales definidos.

Antes de tocar mantenedores editables:

- Tabla local definida.
- Endpoint GET definido.
- Endpoint POST/PATCH protegido.
- Validacion y auditoria local definidas.

## Orden de implementacion propuesto

1. AppShell, Sidebar y Header.
2. Selector global persistente.
3. Torre de Control con datos existentes.
4. Modulo Empresas.
5. Modulo Cajeros / Devices.
6. Modulo Folios / CAF.
7. Modulo Rangos SII.
8. Mantenedor Tipos DTE.
9. Mantenedor Umbrales.
10. Exportacion y procesos.

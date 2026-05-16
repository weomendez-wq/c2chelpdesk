# Decision - Diseno de producto y layout soporte v1

## Fecha

2026-05-15

## Contexto

El proyecto no debe avanzar solo como una suma de endpoints y tablas. La finalidad es construir una consola profesional para el departamento de soporte, con informacion simplificada, confiable y accionable.

El diseno del producto es importante porque soporte necesita:

- Identificar rapidamente empresas con problemas.
- Revisar alertas por emision, devices y folios sin ruido visual.
- Cambiar entre vista global y empresa seleccionada.
- Validar datos certificados antes de tomar decisiones operativas.
- Trabajar con una interfaz clara, compacta y potente.

## Decision

El frontend evolucionara hacia una consola maestro/detalle para soporte.

La primera version debe implementarse con componentes propios en React + TypeScript + CSS del proyecto, sin incorporar Tailwind ni librerias visuales nuevas por defecto.

Las referencias preservadas en `docs/referencias-layout/2026-05-15-layoutExample/` se usaran como inspiracion funcional y visual, no como codigo activo directo.

## Principios de diseno

- Priorizar datos certificados sobre decoracion.
- Mostrar primero el estado operativo global.
- Permitir seleccionar una empresa/tenant como eje de trabajo.
- Mantener numeros compactos y formateados.
- Usar alertas con severidad clara: `OK`, `WARNING`, `URGENTE`, `SIN_EMISION`.
- Reducir ruido: cada card o tabla debe responder una pregunta de soporte.
- Mantener estados visibles de carga, vacio y error.
- Evitar pantallas tipo landing; la primera pantalla debe ser herramienta de trabajo.

## Layout objetivo

```txt
Consola Soporte
+-- Header operativo
|   +-- Selector empresa/tenant
|   +-- Busqueda rapida
|   +-- Filtros principales
+-- Resumen global
|   +-- Empresas
|   +-- Documentos
|   +-- Devices
|   +-- Alertas
+-- Panel empresa seleccionada
|   +-- Identidad: empresa, RUT, tenant
|   +-- Resumen documental
|   +-- Resumen devices
|   +-- Alertas relevantes
+-- Tablas operativas
    +-- Empresas paginadas
    +-- Devices paginados
    +-- Documentos por periodo/tipo
    +-- Folios/CAF en etapa posterior
```

## Componentes a construir

Primera etapa:

- `TenantSelector.tsx`
- `MetricCard.tsx`
- `PaginationBar.tsx`
- `DataTable.tsx`
- `SkeletonTable.tsx`

Segunda etapa:

- `DeviceStatusBadge.tsx`
- `AlertBadge.tsx`
- `CompanyDetailPanel.tsx`
- `LoadingOverlay.tsx`

Etapa posterior:

- `ContactoSelector.tsx`, cuando existan endpoint y datos locales de contactos.
- Graficos mas avanzados, si el volumen y el flujo lo justifican.

## Selecciones contra base de datos

La UI debe consumir backend, no consultar tablas directamente.

Flujo inicial:

```txt
GET /api/support/control/companies
GET /api/support/control/documents-summary
GET /api/support/control/devices
```

Al seleccionar empresa:

```txt
GET /api/support/control/documents-summary?tenantId=<uuid>&rut=<rut>
GET /api/support/control/devices?tenantId=<uuid>&rut=<rut>
```

Tablas paginadas:

```txt
GET /api/support/control/companies?limit=25&offset=0
GET /api/support/control/devices?limit=25&offset=0
```

## Dependencias

Decision actual:

```txt
No agregar Tailwind, Recharts, TanStack Table ni lucide-react en esta etapa.
```

Motivo:

- Mantener el proyecto liviano.
- Evitar migrar el stack visual antes de estabilizar datos y flujo.
- Adaptar primero los patrones de layout con CSS propio.

Decision futura posible:

- Agregar `lucide-react` si los iconos aportan claridad operacional.
- Evaluar `recharts` cuando existan graficos necesarios para soporte.
- Evaluar TanStack Table si la paginacion, ordenamiento o columnas crecen.

## Criterio de exito

La consola v1 sera correcta cuando:

- Soporte pueda entender el estado global en menos de un minuto.
- Al seleccionar una empresa, se vea informacion compacta y coherente.
- Las tablas tengan paginacion real.
- Las alertas puedan priorizar trabajo.
- Los numeros mostrados cuadren con vistas certificadas en `rr_gestion_soporte`.
- El diseno se sienta como herramienta operacional, no como maqueta.

## Proximo paso recomendado

Implementar primero:

```txt
TenantSelector + MetricCard + PaginationBar
```

Luego reorganizar `App.tsx` a layout maestro/detalle antes de sumar nuevos dominios como folios/CAF.

# Referencias de layout preservadas

## Objetivo

Preservar piezas utiles desde `C:\RODPROJECTSCODEX\layoutExample` antes de eliminar esa carpeta.

Estos archivos son referencias visuales y funcionales. No son codigo activo del proyecto actual.

## Regla de uso

- No importar directamente estos archivos en `frontend/src`.
- Adaptar el patron a React + TypeScript + CSS propio.
- Evitar incorporar Tailwind, contexts, rutas o dependencias nuevas sin decision previa.
- Mantener el layout orientado a soporte: informacion compacta, filtros claros y priorizacion por alerta.

## Componentes preservados

| Archivo | Aporte al layout actual | Adaptacion sugerida |
| --- | --- | --- |
| `componentes/TenantSelector.reference.jsx` | Selector principal de empresa/tenant con busqueda | Crear `TenantSelector.tsx` usando datos de `GET /api/support/control/companies` |
| `componentes/ContactoSelector.reference.jsx` | Selector con busqueda, lista y creacion rapida | Dejar para etapa contactos, cuando exista endpoint y tabla local |
| `componentes/PaginationBar.reference.jsx` | Paginacion profesional con tamanos de pagina | Crear `PaginationBar.tsx` conectado a `limit` y `offset` |
| `componentes/DataTable.reference.jsx` | Tabla compacta con header y badges | Crear tabla propia sin Tailwind, con filas seleccionables |
| `componentes/MetricCard.reference.jsx` | Cards KPI con severidad visual | Crear `MetricCard.tsx` para empresas, devices, documentos y folios |
| `componentes/SkeletonTable.reference.jsx` | Placeholder de carga para tablas | Crear `SkeletonTable.tsx` en vez de usar solo spinner |
| `componentes/LoadingOverlay.reference.jsx` | Bloqueo visual durante cambio de tenant | Adaptar como overlay liviano para seleccion de empresa |
| `componentes/DeviceTable.reference.jsx` | Tabla de devices compacta | Adaptar columnas a `device_control_resumen` |
| `componentes/GlobalHealthSummary.reference.jsx` | Cards con progreso operativo | Adaptar a resumen global y empresa seleccionada |

## Paginas preservadas

| Archivo | Aporte | Uso sugerido |
| --- | --- | --- |
| `paginas/GlobalSupportDashboard.reference.jsx` | Composicion completa: header, cards, ranking, tabla y paginacion | Referencia principal para reorganizar `App.tsx` |
| `paginas/AppLayout.reference.jsx` | Layout base con sidebar y main scrollable | Evaluar cuando existan multiples vistas reales |
| `paginas/Sidebar.reference.jsx` | Navegacion lateral por modulos | Postergar hasta tener secciones estables: Empresas, Devices, Documentos, Folios |

## Dependencias observadas en referencias

- Tailwind CSS.
- `lucide-react`.
- `react-router-dom`.
- Contextos globales propios.
- `recharts`.
- `react-hot-toast` / `sonner`.
- Alias `@`.

El proyecto actual no usa esas dependencias. La primera mejora debe implementarse sin agregarlas, salvo que se apruebe explicitamente.

## Plan de adaptacion recomendado

1. Crear componentes propios en `frontend/src/components/`:
   - `TenantSelector.tsx`
   - `MetricCard.tsx`
   - `PaginationBar.tsx`
   - `DataTable.tsx`
   - `SkeletonTable.tsx`
2. Reorganizar `App.tsx` en layout maestro/detalle:
   - Header operativo.
   - Selector empresa/tenant.
   - Cards globales.
   - Panel empresa seleccionada.
   - Tablas paginadas de empresas y devices.
3. Conectar paginacion real contra backend:
   - `GET /api/support/control/companies`
   - `GET /api/support/control/devices`
4. Dejar `ContactoSelector` y folios para una segunda etapa.

## Decision pendiente

Antes de implementar iconos y graficos, decidir si se agregan dependencias:

- Opcion conservadora: CSS propio + texto/badges, sin dependencias nuevas.
- Opcion visual avanzada: agregar `lucide-react` y luego evaluar `recharts`.

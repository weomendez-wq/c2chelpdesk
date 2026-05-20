# Decision: modernizacion UI enterprise

**Fecha**: 2026-05-20

## Contexto

Se solicita modernizar la pagina React usando el criterio `uiux-enterprise-dashboard`:

- responsive
- sidebar empresarial
- cards KPI
- tabla con filtros
- TailwindCSS
- shadcn/ui
- loading states
- diseno tipo Linear/Vercel

## Estado actual

El frontend de `c2c-soporte` hoy usa:

- React + Vite.
- CSS propio en `frontend/src/styles.css`.
- Componentes locales (`MetricCard`, `PaginationBar`, `TenantSelector`).
- Modulo empresas separado en `frontend/src/modules/companies/components/CompaniesModule.tsx`.

Todavia no existe configuracion Tailwind/shadcn en el proyecto:

- no hay `tailwind.config.*`
- no hay `postcss.config.*`
- no hay `components.json`
- no hay libreria de iconos instalada

## Decision tecnica

La modernizacion debe hacerse en etapas para no romper el prototipo operativo:

1. **Base visual enterprise sin dependencia nueva**
   - Mejorar shell, sidebar, header, KPIs, filtros, tablas y loading states usando el CSS actual.
   - Mantener endpoints y estado funcional.

2. **Instalar Tailwind y utilidades UI**
   - Agregar TailwindCSS.
   - Agregar estructura compatible con shadcn/ui.
   - Agregar utilidades `cn`, `button`, `card`, `input`, `select`, `table`, `badge`, `skeleton`.

3. **Migrar modulo empresas a componentes UI**
   - Reemplazar estilos CSS del modulo por clases Tailwind.
   - Mantener logica multi-tenant por `tenant_id` + `rut`.
   - Mantener loading/error/empty/retry.

4. **Extender al resto de modulos**
   - Helpdesk.
   - Mesa de ayuda.
   - Torre de control.
   - Folios/CAF.
   - Alertas.
   - Mantenedores.

## Datos productivos

La indicacion menciona que hay informacion productiva disponible, pero la ruta quedo
pendiente despues de `se encuentran en:`.

Hasta recibir esa ruta, solo se revisaron archivos nuevos en `dbpruebas`:

- `cat_herramientas.csv`
- `cat_modo_soporte.csv`
- `rr_gestion_soporte.cat_herramientas.csv`
- `exportbd.pgerd`

Estos datos parecen utiles para el flujo de tickets/mantenedores de soporte, no para
reemplazar por si solos la fuente operacional del modulo empresas.

## Restricciones

- No ejecutar escrituras contra `public` productivo.
- No activar acciones CRUD reales sin definir fuente de escritura local.
- No instalar dependencias sin validar impacto en build y repositorio.

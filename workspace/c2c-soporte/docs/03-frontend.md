# Frontend

## Objetivo

Preparar un frontend React + Vite + TypeScript para dashboards operativos, analitica DTE y Torre de Control.

## Responsabilidades iniciales

- Consumir APIs del backend, no tablas productivas directamente.
- Mostrar KPIs operativos de forma clara.
- Separar paginas, componentes, hooks, services y adapters.
- Manejar estados de carga, vacio y error.

## Estructura objetivo

```txt
frontend/
├── src/
│   ├── app/
│   ├── components/
│   ├── modules/
│   ├── pages/
│   ├── shared/
│   ├── hooks/
│   ├── services/
│   ├── adapters/
│   ├── layouts/
│   └── context/
```

## Estado inicial implementado

- Scaffolding React + Vite + TypeScript.
- Cliente API encapsulado en `src/services`.
- Primera vista operativa en `src/app`.
- Estados de carga, error y vacio.
- Filtros por busqueda y estado.

## Primera implementacion original

La primera pantalla consume:

```txt
GET /api/support/company-devices
```

Objetivo:

- Listar empresas y dispositivos en una vista operativa.
- Filtrar por texto y estado de dispositivo.
- Mostrar conteos basicos para soporte.
- Mantener el frontend alineado con las vistas locales `rr_gestion_soporte`.

## Enfoque certificado por empresa

La pantalla inicial debe consumir primero:

```txt
GET /api/support/control/companies
```

Objetivo:

- Validar empresas como dominio aislado antes de mezclar devices, CAF o folios.
- Mostrar cuadratura de empresas por estado.
- Mostrar alertas por emision: `OK`, `WARNING`, `URGENTE`, `SIN_EMISION`.
- Permitir buscar por empresa, RUT o tenant.
- Filtrar por estado de empresa y nivel de alerta.
- Permitir seleccionar una empresa para ver resumen documental 2026 filtrado por `tenantId` y `rut`.
- Mostrar indicador de espera cuando se cargan empresas o resumen documental.

## Decisiones tecnicas

- Lenguaje: TypeScript.
- Build tool: Vite.
- Estilos: CSS inicial en `src/styles.css`; Tailwind queda como decision posterior si aporta valor real al sistema de componentes.
- Estado remoto/API: `fetch` encapsulado en services para esta primera pantalla.
- Tablas: HTML semantico inicial; TanStack Table queda reservado para vistas con paginacion, ordenamiento y seleccion masiva.
- Graficos: Recharts queda reservado para dashboards posteriores.
- Cliente HTTP: `fetch` encapsulado en services/adapters.

## Decision de producto y layout

La interfaz debe tratarse como producto de soporte, no solo como una tabla de datos.

Documento rector:

```txt
docs/decisiones/2026-05-15-diseno-producto-layout-soporte-v1.md
```

Direccion acordada:

- Evolucionar a consola maestro/detalle.
- Usar empresa/tenant como seleccion principal.
- Implementar componentes propios antes de agregar dependencias visuales.
- Priorizar informacion certificada, compacta y accionable.
- Reutilizar como referencia el snapshot preservado en `docs/referencias-layout/2026-05-15-layoutExample/`.

Componentes base a crear:

```txt
TenantSelector.tsx
MetricCard.tsx
PaginationBar.tsx
DataTable.tsx
SkeletonTable.tsx
```

## Avance layout v1

Implementado:

```txt
frontend/src/components/TenantSelector.tsx
frontend/src/components/MetricCard.tsx
frontend/src/components/PaginationBar.tsx
```

Cambios aplicados:

- Selector principal de empresa/tenant en la cabecera.
- Cards reutilizables para resumen de empresas, documentos y devices.
- Paginacion real para tablas de empresas y devices.
- Backend entrega `pagination.total` en endpoints de control de empresas y devices.

Pendiente:

```txt
DataTable.tsx
SkeletonTable.tsx
Reorganizacion completa maestro/detalle de App.tsx
```

## Ejecucion local

```powershell
cd C:\RODPROJECTSCODEX\workspace\c2c-soporte\frontend
npm install
npm run dev
```

El proxy de Vite apunta a `http://localhost:5491`, por lo que el backend debe estar levantado en ese puerto para consumir `/api/support/control/companies` durante desarrollo.

## Manual de validacion

La validacion funcional primaria del frontend y backend esta documentada en:

```txt
docs/15-manual-usuario-primario.md
```

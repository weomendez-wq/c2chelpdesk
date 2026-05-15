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

## Primera implementacion

La primera pantalla consume:

```txt
GET /api/support/company-devices
```

Objetivo:

- Listar empresas y dispositivos en una vista operativa.
- Filtrar por texto y estado de dispositivo.
- Mostrar conteos basicos para soporte.
- Mantener el frontend alineado con las vistas locales `rr_gestion_soporte`.

## Decisiones tecnicas

- Lenguaje: TypeScript.
- Build tool: Vite.
- Estilos: CSS inicial en `src/styles.css`; Tailwind queda como decision posterior si aporta valor real al sistema de componentes.
- Estado remoto/API: `fetch` encapsulado en services para esta primera pantalla.
- Tablas: HTML semantico inicial; TanStack Table queda reservado para vistas con paginacion, ordenamiento y seleccion masiva.
- Graficos: Recharts queda reservado para dashboards posteriores.
- Cliente HTTP: `fetch` encapsulado en services/adapters.

## Ejecucion local

```powershell
cd C:\RODPROJECTSCODEX\workspace\c2c-soporte\frontend
npm install
npm run dev
```

El proxy de Vite apunta a `http://localhost:3000`, por lo que el backend debe estar levantado en ese puerto para consumir `/api/support/company-devices` durante desarrollo.

## Manual de validacion

La validacion funcional primaria del frontend y backend esta documentada en:

```txt
docs/15-manual-usuario-primario.md
```

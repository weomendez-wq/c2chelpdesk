# Frontend

## Objetivo

Preparar un frontend React + Vite + Tailwind para dashboards operativos, analitica DTE y Torre de Control.

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

## Pendientes antes de implementar

- Crear scaffolding React + Vite + TypeScript.
- Configurar Tailwind.
- Crear estructura `src` por modulos.
- Crear cliente API encapsulado.
- Definir criterios responsive para dashboard operacional.

## Decisiones tecnicas

- Lenguaje: TypeScript.
- Build tool: Vite.
- Estilos: Tailwind.
- Estado remoto/API: TanStack Query.
- Tablas: TanStack Table.
- Graficos: Recharts.
- Cliente HTTP: `fetch` encapsulado en services/adapters.

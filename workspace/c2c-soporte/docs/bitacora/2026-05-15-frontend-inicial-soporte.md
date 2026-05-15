# Bitacora - Frontend inicial soporte

## Fecha

2026-05-15

## Objetivo

Crear el frontend inicial para C2C Soporte desde el orden funcional definido.

## Alcance

Primera pantalla:

```txt
Empresa -> Dispositivos
```

Fuente API:

```txt
GET /api/support/company-devices
```

## Criterio

- No crear landing page.
- No usar datos mock.
- Consumir backend local mediante cliente API encapsulado.
- Mostrar estados de carga, error y vacio.
- Mantener UI operativa, densa y orientada a soporte.

## Entregables

- Scaffolding React + Vite + TypeScript.
- Cliente API base.
- Vista inicial de empresas/dispositivos.
- Filtros por busqueda y estado.
- Resumen de conteos visibles para soporte.

## Validacion

- `npm install`: OK, 69 paquetes instalados, 0 vulnerabilidades.
- `npm run typecheck`: OK.
- `npm run build`: OK.

Nota:

- El build Vite requirio ejecucion fuera del sandbox por bloqueo `spawn EPERM` de `esbuild`.
- Se ajustaron los scripts TypeScript para ejecutar `--noEmit` y evitar archivos generados como `vite.config.js`, `vite.config.d.ts` y `tsbuildinfo`.

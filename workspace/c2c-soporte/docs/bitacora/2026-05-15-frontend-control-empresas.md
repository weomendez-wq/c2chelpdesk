# Bitacora - Frontend control empresas

## Fecha

2026-05-15

## Objetivo

Cambiar la primera pantalla del frontend para consumir la vista certificada de empresas.

## Endpoint

```txt
GET /api/support/control/companies
```

## Criterio

La pantalla inicial debe mostrar primero numeros certificados por empresa:

- Total de empresas.
- Empresas activas.
- Empresas sin emision.
- Empresas urgentes.
- Tabla de revision por empresa.

No se mezclan devices, CAF ni folios en esta pantalla.

## Validacion

Comandos ejecutados:

```txt
npm run typecheck
npm run build
```

Resultado:

```txt
typecheck: OK
build: OK
```

Nota:

- El build Vite requirio ejecucion fuera del sandbox por bloqueo `spawn EPERM` de `esbuild`.

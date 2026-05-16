# Shell C2C Helpdesk

Fecha: 2026-05-16

## Objetivo

Iniciar la implementacion visual del producto `c2c-helpdesk` siguiendo el mapa de modulos documentado.

## Cambios realizados

- Se agrego shell principal con sidebar.
- Se agrego navegacion por modulos:
  - Torre de Control
  - Empresas
  - Cajeros / Devices
  - Documentos
  - Folios / CAF
  - Rangos SII
  - Alertas
  - Procesos
  - Mantenedores
  - Configuracion
- Se mantuvo el selector global en el header.
- Se agregaron tarjetas de plan para modulos todavia no implementados.
- No se cambiaron endpoints ni consultas backend.

## Verificacion

```txt
npm run typecheck
npm run build
```

Resultado:

```txt
typecheck OK
build OK
```

Nota:

La primera ejecucion de build fallo por `spawn EPERM` al iniciar esbuild dentro del sandbox. Se repitio fuera del sandbox y compilo correctamente.


# Bitacora - Layout por modulos enfocados

## Problema

La pantalla principal mostraba todos los bloques operativos uno debajo de otro:

- Helpdesk
- Mesa de Ayuda
- Torre de Control
- Empresas
- Cajeros
- Documentos
- Folios / CAF
- Rangos SII
- Alertas
- Procesos
- Mantenedores

Esto dificultaba encontrar informacion rapidamente y obligaba a recorrer demasiada pantalla.

## Cambio

Se agrego una navegacion por modulo activo.

Ahora el usuario puede seleccionar un modulo desde el sidebar y la pantalla muestra solo ese bloque.

Tambien se agrego una opcion:

```txt
Todo
```

para revisar la vista completa cuando se necesite.

## Criterio

Mantener el dashboard actual sin reescribir datos ni endpoints, pero mejorar la accesibilidad del flujo operativo.

## Alcance

- Cambio solo frontend.
- Sin cambios de base de datos.
- Sin cambios backend.
- Sin modificar reglas SQL.

## Verificacion

- `npm run typecheck` ejecutado correctamente en `frontend`.

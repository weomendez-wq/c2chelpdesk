# Plan modulos y mantenedores

Fecha: 2026-05-16

## Contexto

Luego de normalizar querys desde `layoutExample`, se decide detener la incorporacion de consultas y ordenar el producto `c2c-helpdesk`.

## Documentos creados

```txt
docs/21-mapa-modulos-c2c-helpdesk.md
docs/22-plan-mantenedores-c2c-helpdesk.md
docs/23-plan-diseno-pruebas-c2c-helpdesk.md
```

## Decision operativa

Antes de continuar con codigo se trabajara en este orden:

1. Mapa de modulos.
2. Shell del producto.
3. Mantenedores base.
4. Diseno de interaccion.
5. Endpoints por modulo.
6. Pruebas y manual.

## Regla vigente

Los mantenedores editables solo podran modificar tablas locales `rr_gestion_soporte`.

No se permite modificar `public` ni `staging_public` desde mantenedores.


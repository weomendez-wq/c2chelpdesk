# Decision: pool de puertos c2c-soporte

**Fecha**: 2026-05-20

## Decision

`c2c-soporte` usara el pool local `5490-5499` para evitar conflictos con otros
proyectos ejecutados en la misma maquina.

## Asignacion inicial

| Servicio | Puerto |
|---|---:|
| Frontend Vite | 5490 |
| Backend API | 5491 |
| PostgreSQL local soporte | 5492 |

## Criterio

- Mantener todos los servicios del proyecto dentro de una misma decena.
- Evitar puertos genericos compartidos como `5173`, `3000` o `5434`.
- Dejar el orquestador como fuente de verdad para agentes, IDEs y sesiones IA.

## Impacto esperado

- El frontend debe ejecutar en `http://localhost:5490`.
- El proxy de Vite debe apuntar al backend `http://localhost:5491`.
- El backend debe leer `PORT=5491`.
- La conexion local a PostgreSQL debe apuntar a `localhost:5492` cuando el
  servicio local sea migrado a ese puerto.

## Restriccion permanente

No ejecutar acciones de escritura, eliminacion, actualizacion, bloqueo, permisos,
DDL o mantenimiento destructivo contra el esquema `public` productivo.

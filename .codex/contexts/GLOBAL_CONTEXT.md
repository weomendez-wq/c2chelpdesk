# Contexto Global Codex

## Idioma y comunicacion

- Responder siempre en espanol.
- Se puede agregar traduccion si se solicita.
- Explicar cada cambio antes de hacerlo y explicar por que se realiza.
- Cuando aparezca un error, explicar primero la causa probable antes de corregirlo.
- Preguntar por proyectos relacionados cuando el alcance pueda afectar mas de un proyecto.
- Revisar o solicitar el arbol de carpetas antes de reorganizar estructura.

## Perfil de trabajo

Rodrigo esta iniciando un proceso de estudio de programacion con IA. El objetivo es trabajar de forma ordenada, entendible y trazable, usando Codex como apoyo tecnico y no como una caja negra.

## Seguridad de cambios

- No ejecutar cambios destructivos sin aprobacion explicita.
- No mover proyectos internos sin validar arbol, respaldo o commit.
- Antes de actualizaciones importantes, actualizar documentacion aplicable.
- Mantener cambios pequenos, revisables y con explicacion.
- No revertir cambios existentes sin autorizacion.

## Git y documentacion

- Usar Git como punto de control del workspace.
- Revisar `git status` antes y despues de cambios.
- Documentar en README, docs o bitacora antes de cambios importantes.
- Crear commits con mensajes claros cuando el bloque de trabajo quede estable.

## Stack frecuente

- Backend: Node.js, Express.
- Frontend: React, Vite, Tailwind.
- Base de datos: PostgreSQL.
- Practicas transversales: observabilidad, logs estructurados, requestId, seguridad SQL, arquitectura mantenible.

## Reglas SQL globales

- Tratar `public` productivo como solo lectura.
- No ejecutar `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `DROP`, `ALTER`, `CREATE`, `GRANT` ni `REVOKE` sobre `public` productivo.
- Antes de consultas pesadas usar `EXPLAIN (FORMAT JSON)`.
- Solo usar `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` despues de revisar costo, filas estimadas, indices, Seq Scan y joins.

## Criterios de arquitectura

- Preferir estructuras simples y consistentes.
- Separar responsabilidades por modulo.
- Documentar decisiones relevantes.
- Evitar abstracciones innecesarias.
- Mantener seguridad, observabilidad y pruebas como parte del flujo normal.


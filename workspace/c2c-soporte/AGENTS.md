# Instrucciones para C2C Soporte

- Responder siempre en espanol.
- Explicar cada cambio antes de realizarlo y por que.
- Ante errores, explicar primero la causa antes de corregir.
- Mantener `public` productivo como solo lectura.
- No ejecutar `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `DROP`, `ALTER`, `CREATE`, `GRANT` ni `REVOKE` sobre `public` productivo.
- Regla critica reforzada: no ejecutar ninguna accion de escritura, eliminacion, actualizacion, bloqueo, permisos, DDL, mantenimiento destructivo o funcion con efectos laterales contra `public`.
- Esto aplica tambien a scripts historicos, funciones recicladas, vistas materializadas, queries generadas y pruebas manuales.
- La informacion operacional de 2026 debe consultarse desde los objetos locales ya migrados: `staging_public.*` y `rr_gestion_soporte.*`.
- Antes de consultas pesadas usar `EXPLAIN (FORMAT JSON)`.
- Usar `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` solo despues de revisar el plan.
- Documentar cambios importantes antes de modificar codigo o SQL.
- No tocar credenciales ni archivos `.env` sin autorizacion.
- No mover carpetas ni reorganizar estructura sin revisar el arbol.

## Proyecto

Proyecto objetivo: C2C Soporte / DTE / Torre de Control.

## Stack esperado

- Backend: Node.js + Express.
- Frontend: React + Vite + Tailwind.
- Base de datos: PostgreSQL.
- Observabilidad: logs estructurados, requestId, metricas y trazabilidad.

# Bitacora - Endpoint SQL explain

## Fecha

2026-05-15

## Objetivo

Crear el primer modulo seguro de analisis SQL para ejecutar solo `EXPLAIN (FORMAT JSON)` sobre consultas de lectura.

## Cambios realizados

- Crear validador SQL conservador.
- Crear servicio de `EXPLAIN`.
- Crear endpoint `POST /api/admin/sql/explain`.
- Detectar `Seq Scan` en el plan JSON.
- Mantener bloqueo de comandos peligrosos.

## Regla de seguridad

El endpoint no ejecuta `EXPLAIN ANALYZE` ni consultas de escritura. Si una consulta no comienza con `SELECT` o `WITH`, contiene multiples sentencias, comentarios o comandos peligrosos, debe rechazarse antes de llegar a PostgreSQL.

## Verificacion ejecutada

- `npm run typecheck`.
- `npm run build`.
- `GET /api/health` con servidor temporal.
- `POST /api/admin/sql/explain` con `DROP TABLE public.documentos`.

Resultado del bloqueo:

```json
{
  "ok": false,
  "error": {
    "code": "SQL_NOT_READ_ONLY",
    "message": "Solo se permiten consultas SELECT o WITH"
  },
  "meta": {
    "requestId": "codex-sql-blocked"
  }
}
```

## Pendientes

- Probar `EXPLAIN` contra PostgreSQL local `soporte` cuando exista conexion.
- Agregar autenticacion/autorizacion antes de exponer endpoints administrativos.
- Agregar pruebas automatizadas del validador SQL.

# Bitacora - Normalizacion scriptbdsoporte

## Contexto

Se analizo `dbpruebas/scriptbdsoporte.sql`, entregado como base para el modulo de soporte/tickets.

## Hallazgos

- El script crea tablas en `rr_gestion_soporte`.
- No toca `public`.
- No contiene `DROP`, `INSERT`, `UPDATE`, `DELETE` ni `TRUNCATE`.
- Usa secuencias `nextval(...)` no declaradas explicitamente.
- Los `ALTER TABLE ... ADD CONSTRAINT` no son idempotentes.

## Decision

No ejecutar el script original tal cual.

Crear una base normalizada con prefijo `helpdesk_`, usando `IDENTITY`, FKs protegidas por validacion en `pg_constraint`, y campos operacionales requeridos por C2C:

- `tenant_id`
- `rut`
- `device_id`
- `document_type`
- `cafserial`
- rangos de folio
- origen/severidad de alerta
- vinculos flexibles con entidades operativas

## Archivos creados

- `docs/27-analisis-scriptbdsoporte.md`
- `database/sql/38-create-helpdesk-foundation.sql`
- `database/sql/39-verify-helpdesk-foundation.sql`

## Ejecucion local

Base local:

```txt
postgresql://postgres@localhost:5434/soporte
```

Resultado:

- `38-create-helpdesk-foundation.sql` ejecutado correctamente.
- `39-verify-helpdesk-foundation.sql` ejecutado correctamente despues de corregir el ordenamiento de constraints.
- Segunda ejecucion de `38-create-helpdesk-foundation.sql` validada como idempotente; PostgreSQL mostro `NOTICE` por tablas e indices existentes, sin errores.

Objetos verificados:

- 9 tablas `helpdesk_*`.
- 117 columnas.
- 81 constraints.
- 26 indices.

No se ejecuto ningun SQL contra `public`.
No se insertaron datos semilla.
No se modificaron datos origen.

## Pendiente

Confirmar datos semilla antes de insertar catalogos:

- estados
- prioridades
- canales
- tipos de soporte
- responsables
- herramientas

# Decision - Catalogo local de responsables Helpdesk

Fecha: 2026-05-18

## Contexto

La Mesa de Ayuda necesita asignar tickets a personas o grupos internos. Si se usa texto libre, despues sera dificil filtrar, medir carga, revisar tiempos y auditar responsabilidades.

## Decision

La primera version incluira un catalogo local de responsables.

Tabla propuesta:

```txt
rr_gestion_soporte.helpdesk_assignee
```

## Campos propuestos

- `assignee_id`
- `display_name`
- `email`
- `role`
- `team`
- `active`
- `created_at`
- `updated_at`

## Roles iniciales

```txt
SOPORTE
OPERACIONES
TECNICO
ADMIN
LECTURA
```

## Reglas

- Un ticket puede estar sin responsable al crearse.
- Cuando se asigna responsable, se registra evento `ASSIGNED`.
- Solo responsables activos deben aparecer para nuevas asignaciones.
- Tickets historicos mantienen el responsable aunque luego quede inactivo.
- El catalogo vive solo en `rr_gestion_soporte`.

## Justificacion

Permite ordenar carga de trabajo, filtrar bandejas y preparar reportes de gestion sin depender todavia de un sistema externo de usuarios.

## Impacto

El modelo SQL debe incluir:

- Tabla `helpdesk_assignee`.
- Referencia opcional desde `helpdesk_ticket.assigned_to`.

El frontend debe permitir:

- Filtrar tickets por responsable.
- Asignar o cambiar responsable.
- Mostrar tickets sin asignar.

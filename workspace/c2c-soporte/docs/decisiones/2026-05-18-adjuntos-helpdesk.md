# Decision - Adjuntos en Mesa de Ayuda

Fecha: 2026-05-18

## Contexto

Los tickets podrian requerir evidencia: capturas, correos, documentos, XML, archivos CAF o exportaciones. Sin embargo, incorporar adjuntos desde la primera version agrega decisiones de almacenamiento, limites, seguridad, virus scan, permisos y respaldos.

## Decision

Los adjuntos quedan fuera de la primera version funcional de Mesa de Ayuda.

La primera version permitira comentarios y contexto estructurado, pero no carga de archivos.

## Justificacion

El objetivo inicial es validar el flujo de tickets:

- crear
- asignar
- comentar
- cambiar estado
- cerrar
- reabrir

Agregar adjuntos ahora aumentaria el alcance y podria retrasar la validacion del flujo principal.

## Regla futura

Cuando se implementen adjuntos, deben vivir en una tabla local separada:

```txt
rr_gestion_soporte.helpdesk_ticket_attachment
```

Campos candidatos:

- `attachment_id`
- `ticket_id`
- `file_name`
- `mime_type`
- `file_size`
- `storage_path`
- `checksum`
- `uploaded_by`
- `uploaded_at`
- `active`

## Restricciones futuras

- No guardar binarios grandes directamente en la tabla de ticket.
- Definir almacenamiento local o externo antes de implementar.
- Registrar auditoria de carga.
- Definir limites de tamano y tipos permitidos.
- No permitir adjuntos sin ticket.

## Impacto primera version

- No hay endpoint de upload.
- No hay UI de adjuntos.
- El timeline puede registrar comentarios de evidencia textual.
- El modelo queda preparado para adjuntos en fase posterior.

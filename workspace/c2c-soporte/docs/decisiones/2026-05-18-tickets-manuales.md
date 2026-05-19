# Decision - Tickets manuales

Fecha: 2026-05-18

## Contexto

La Mesa de Ayuda puede recibir casos que no nacen desde una alerta operacional. Por ejemplo:

- Consulta de cliente.
- Revision preventiva solicitada por soporte.
- Seguimiento de una gestion interna.
- Caso detectado telefonicamente o por correo.
- Solicitud relacionada con empresa, device o folios que aun no genera alerta automatica.

## Decision

La primera version de Mesa de Ayuda permitira crear tickets manuales.

## Regla

Un ticket manual debe tener al menos uno de estos contextos:

- `tenant_id` y `rut`.
- `category`.
- `description` suficientemente descriptiva.

Si el ticket no nace desde alerta, su origen sera:

```txt
MANUAL
```

## Justificacion

No todos los casos de soporte comienzan en una alerta del sistema. Si se bloquea la creacion manual, el equipo terminaria gestionando casos fuera de la herramienta y se perderia trazabilidad.

## Restricciones

- Un ticket manual no modifica datos origen.
- Un ticket manual no crea ni corrige alertas.
- Debe registrar evento `CREATED`.
- Debe registrar usuario `opened_by`.
- Si luego se relaciona con una alerta, se agrega link `ALERTA` en `helpdesk_ticket_link`.

## Impacto

El modelo SQL debe permitir:

- `source = MANUAL`.
- `alert_source`, `alert_severity` y `alert_entity_id` nulos.
- Relacion opcional con empresa, device, CAF o rango.

El frontend debe permitir:

- Crear ticket desde alerta.
- Crear ticket manual desde Mesa de Ayuda.
- Seleccionar empresa cuando corresponda.

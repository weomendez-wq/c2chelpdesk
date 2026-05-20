# Bitacora: Gmail Helpdesk

**Fecha**: 2026-05-20

## Decision

El canal obligatorio de entrada para Mesa de Ayuda sera Gmail.

## Criterio

Gmail aporta valor inmediato porque permite convertir correos reales en tickets
con trazabilidad, deduplicacion y revision por agente antes de automatizar todo.

## Linea tecnica

- Usar Gmail API con OAuth.
- No usar password directo ni guardar tokens en codigo.
- Registrar mensajes en `rr_gestion_soporte.helpdesk_email_message`.
- Crear tickets en `rr_gestion_soporte.helpdesk_ticket`.
- Mantener deduplicacion por `message_id` y `hash_dedup`.
- Dejar mensajes ambiguos en revision.

## Canales posteriores

- WhatsApp queda para etapa posterior con WhatsApp Business API o proveedor con webhook.
- Telefono IP queda para etapa posterior si existe API, PBX, CDR o registro exportable.
- Mientras tanto, ambos pueden entrar por ticket manual con canal correspondiente.

## Pendiente

Definir casilla Gmail exacta, estrategia OAuth y si el primer sync sera manual
por boton o proceso programado local.

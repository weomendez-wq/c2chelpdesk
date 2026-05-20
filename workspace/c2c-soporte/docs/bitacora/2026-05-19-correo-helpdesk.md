# Bitacora - Correo Helpdesk

## Objetivo

Preparar la conexion de correo de soporte con Mesa de Ayuda sin conectar aun una casilla real.

## Alcance actual

- Definir decision tecnica para integracion por etapas.
- Crear SQL local para trazabilidad de mensajes de correo.
- Crear endpoint de ingesta simulada.
- Reutilizar el flujo existente de creacion de tickets manuales.

## Alcance posterior

- Elegir proveedor real: IMAP, Microsoft Graph, Gmail API o webhook.
- Manejar adjuntos.
- Reglas de asignacion automatica.
- Deteccion avanzada de empresa por RUT, tenant o dominio de correo.

## Regla de datos

La integracion escribe solo en `rr_gestion_soporte.helpdesk_*`.

No se toca `public`.
No se leen credenciales desde codigo fuente.

# Bitacora - Prototipo Helpdesk frontend

Fecha: 2026-05-17

## Objetivo

Iniciar el primer prototipo visual del segmento Helpdesk para reducir la complejidad del dashboard actual.

## Causa

El dashboard actual expone mucha informacion tecnica en paralelo: empresas, documentos, devices, folios, rangos, alertas, procesos y mantenedores. Aunque los datos estan disponibles, para soporte es dificil decidir donde mirar primero.

## Criterio de diseno

El prototipo debe ordenar la experiencia como flujo de atencion:

1. Contexto operativo.
2. Empresa en foco.
3. Prioridad inmediata.
4. Estado SII / CAF por tipo DTE.
5. Detalle bajo demanda.

## Alcance de esta iteracion

- No crear endpoints nuevos.
- No cambiar reglas de negocio.
- No tocar base de datos.
- Reutilizar datos ya cargados desde endpoints existentes.
- Agregar una franja superior de trabajo Helpdesk que sintetice informacion y dirija al usuario hacia el detalle.

## Decisiones

- El prototipo no reemplaza todavia los modulos actuales.
- Los modulos actuales quedan disponibles para observacion y validacion.
- La vista superior debe ayudar a decidir que revisar primero, no mostrar todos los campos.
- Las cards por DTE se enfocan inicialmente en `33`, `39` y `41`.
- El layout debe quedar preparado para una futura Mesa de Ayuda con tickets.
- Las alertas actuales se consideran futuros candidatos a casos/tickets.
- La gestion de tickets debe vivir en un modulo propio, pero compartir tenant, RUT, empresa, device, folios y alertas como contexto.

## Consideracion futura Mesa de Ayuda

Cuando se integre la mesa de ayuda del servicio de soporte, el prototipo debera evolucionar hacia:

- Bandeja de tickets.
- Detalle de ticket.
- Timeline de acciones.
- Vinculo ticket-alerta.
- Vinculo ticket-empresa/device/CAF/rango.
- Estados de ticket independientes de los datos origen.
- Auditoria de gestion del equipo de soporte.

## Validacion esperada

- Frontend typecheck OK.
- Frontend build OK.
- La pantalla debe mostrar un bloque superior legible en desktop y mobile.
- No debe aumentar consultas al backend.

## Validacion ejecutada

- `npm run typecheck`: OK.
- `npm run build`: OK fuera del sandbox.
- `GET http://localhost:5173/`: 200.
- `GET http://localhost:5173/api/health`: 200.

Nota: no se pudo capturar screenshot desde esta sesion porque la herramienta de control del navegador no esta disponible en el entorno actual. La revision visual queda pendiente con el servidor local activo.

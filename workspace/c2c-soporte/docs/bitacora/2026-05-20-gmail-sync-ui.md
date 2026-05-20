# 2026-05-20 - Sincronizacion Gmail desde Mesa de Ayuda

## Objetivo

Agregar una accion manual en el frontend para ejecutar la sincronizacion Gmail del helpdesk sin depender solo del comando local.

## Alcance

- Mantener la sincronizacion como accion manual y confirmada desde backend.
- Mostrar estado de espera mientras se consulta Gmail.
- Mostrar resultado compacto: procesados, creados, duplicados y omitidos.
- Refrescar la lista de tickets cuando la sincronizacion termina correctamente.

## Restricciones

- No se agregan credenciales al frontend.
- No se ejecutan acciones contra `public`.
- Si Gmail esta deshabilitado por configuracion, la UI debe mostrar el mensaje controlado del backend.


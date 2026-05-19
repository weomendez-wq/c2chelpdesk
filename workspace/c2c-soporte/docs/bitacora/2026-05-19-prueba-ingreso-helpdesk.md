# Bitacora - Prueba de ingreso Helpdesk

## Objetivo

Validar que la base local `helpdesk_*` permite crear un ticket completo con sus relaciones principales.

## Estrategia

Crear una prueba transaccional con `ROLLBACK` para no dejar datos persistidos.

La prueba cubre:

- responsable
- contacto
- ticket
- evento de timeline
- link operacional
- tiempo de trabajo
- herramienta
- relacion ticket/herramienta

## Archivo

```txt
database/sql/40-test-helpdesk-ticket-entry.sql
```

## Regla

La prueba debe terminar con:

```txt
persisted_test_tickets = 0
```

Si el valor es mayor a cero, la prueba dejo datos persistidos y debe revisarse antes de continuar.

## Resultado local

Base:

```txt
postgresql://postgres@localhost:5434/soporte
```

Salida relevante:

```txt
ticket_id = 1
ticket_number = 1
event_id = 1
link_id = 1
time_entry_id = 1
tool_id = 1
ticket_tool_id = 1
persisted_test_tickets = 0
```

Conclusion:

```txt
Prueba OK. El modelo permite ingresar un ticket completo y el rollback no deja datos persistidos.
```

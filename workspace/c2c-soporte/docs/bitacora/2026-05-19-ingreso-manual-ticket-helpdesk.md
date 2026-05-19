# Bitacora - Ingreso manual externo de tickets

## Prioridad

Urgente.

## Objetivo

Permitir el primer ingreso manual de tickets externo al dashboard operacional.

Caso inicial:

```txt
Canal de comunicacion: correo
Origen: MANUAL
```

## Alcance v1

- Crear endpoint backend para registrar ticket manual.
- Registrar evento inicial `CREATED`.
- Consultar bandeja reciente de tickets.
- Agregar formulario en el modulo Mesa Ayuda.

## Fuera de alcance inmediato

- Adjuntos.
- Autenticacion de usuarios.
- Derivaciones complejas.
- Integracion directa con correo.
- Cierre/reapertura desde frontend.

## Regla de datos

La persistencia queda solo en:

```txt
rr_gestion_soporte.helpdesk_*
```

No se toca `public`.
No se modifica informacion origen.

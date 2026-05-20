# Validacion Gmail Helpdesk

Fecha: 2026-05-20

## Objetivo

Validar la casilla real Gmail de soporte antes de convertir este flujo en una skill operativa del proyecto.

La validacion debe comprobar que un correo nuevo puede crear un ticket y que un correo ya procesado no genera duplicados.

## Alcance

- Ejecutar sincronizacion manual por comando.
- Ejecutar sincronizacion manual desde la UI.
- Registrar trazabilidad local en `rr_gestion_soporte.helpdesk_email_message`.
- Crear tickets solo en `rr_gestion_soporte.helpdesk_*`.

## Fuera de alcance

- No automatizar polling aun.
- No crear skill formal aun.
- No escribir ni modificar `public`.
- No versionar secretos OAuth.

## Variables requeridas

Estas variables deben quedar solo en `backend/.env` local:

```txt
GMAIL_ENABLED=true
GMAIL_SUPPORT_MAILBOX=correo-soporte@dominio.cl
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
GMAIL_REFRESH_TOKEN=...
GMAIL_LABEL_PROCESSED=C2C_HELPDESK_PROCESSED
GMAIL_LABEL_REVIEW=C2C_HELPDESK_REVIEW
```

`GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET` y `GMAIL_REFRESH_TOKEN` no deben quedar
en README, bitacoras, capturas ni commits.

## Prueba 1 - Conector deshabilitado

Con `GMAIL_ENABLED=false`:

```powershell
cd C:\RODPROJECTSCODEX\workspace\c2c-soporte\backend
npm run gmail:sync -- --max 1 --requested-by soporte-local
```

Resultado esperado:

```json
{
  "ok": false,
  "error": {
    "code": "GMAIL_DISABLED"
  }
}
```

## Prueba 2 - Configuracion incompleta

Con `GMAIL_ENABLED=true` pero sin OAuth completo:

```powershell
npm run gmail:sync -- --max 1 --requested-by soporte-local
```

Resultado esperado:

```json
{
  "ok": false,
  "error": {
    "code": "GMAIL_NOT_CONFIGURED"
  }
}
```

## Prueba 3 - Casilla real

Con OAuth completo:

```powershell
npm run gmail:sync -- --max 1 --requested-by soporte-local
```

Resultado esperado:

```json
{
  "ok": true,
  "data": {
    "processed": 1,
    "created": 1,
    "duplicates": 0,
    "skipped": 0
  }
}
```

Si la bandeja no tiene correos que coincidan con la query por defecto, `processed`
puede ser `0`.

## Prueba 4 - Deduplicacion

Ejecutar nuevamente el mismo comando.

Resultado esperado:

```json
{
  "ok": true,
  "data": {
    "duplicates": 1
  }
}
```

El numero exacto depende de cuantos correos procese la consulta, pero no debe
crear un segundo ticket para el mismo `message_id`.

## Prueba 5 - UI

1. Abrir `http://localhost:5490`.
2. Entrar a `Mesa de Ayuda`.
3. Presionar `Sincronizar Gmail`.
4. Revisar metricas: procesados, creados, duplicados, omitidos.
5. Confirmar que la bandeja de tickets se refresca.

## Query Gmail recomendada para primera prueba

Para reducir riesgo, usar una busqueda acotada:

```powershell
npm run gmail:sync -- --max 1 --query "in:inbox newer_than:7d" --requested-by soporte-local
```

Cuando la casilla tenga mucho ruido, se recomienda crear una etiqueta o usar un
asunto controlado para prueba.

## Criterios de cierre

- El comando responde controladamente con Gmail deshabilitado.
- OAuth incompleto entrega `GMAIL_NOT_CONFIGURED`.
- OAuth valido permite consultar Gmail.
- Un correo nuevo crea ticket.
- El mismo correo no duplica ticket.
- La UI ejecuta la misma accion sin exponer secretos.

## Decision posterior

Si las pruebas pasan, este flujo se puede convertir en una skill del proyecto:

```txt
skill: validar-gmail-helpdesk-c2c
```

La skill debe incluir:

- prechequeo del orquestador,
- comandos de validacion,
- errores esperados,
- criterios de cierre,
- recordatorio de no exponer secretos.


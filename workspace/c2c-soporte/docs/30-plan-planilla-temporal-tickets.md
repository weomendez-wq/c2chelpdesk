# Plan temporal Gmail -> Planilla Tickets Soporte

Fecha: 2026-05-20

## Objetivo

Usar la planilla `Hoja de Tickets Soporte S1.xlsx` como bandeja temporal de tickets mientras se termina el modulo Helpdesk del aplicativo.

La idea es leer correos de soporte desde Gmail, desde la fecha posterior al ultimo registro historico disponible, y registrar esos correos como tickets en la planilla con una clave de deduplicacion.

## Archivo analizado

Ruta local inspeccionada:

```txt
C:\RODPROJECTSCODEX\layoutExample\Hoja de Tickets Soporte S1.xlsx
```

No se versiona el archivo porque contiene datos operativos, contactos y potencial informacion sensible.

## Hojas relevantes

### `INFO_TICKETS`

Hoja historica principal.

- Filas: 329
- Columnas detectadas: 25
- Contiene informacion historica hasta febrero de 2026 segun contexto operativo indicado.
- La columna 25 existe sin encabezado, por lo que puede usarse como primer campo tecnico si se decide no alterar demasiado el formato.

Encabezados principales:

```txt
Marca temporal
Direccion de correo electronico
Numero Item
Fecha Creacion Ticket
Hora Creacion Ticket
Rut Cliente
Nombre Cliente
Fecha Solicitud Ticket
Hora Solicitud Ticket
Fecha Ejecucion Ticket
Hora Inicio Solicitud
Hora Termino Solicitud
Asunto Correo u Observacion Corta
Tipo de Soporte
Modalidad Soporte
Tipo Incidente
Estado Ticket
Canal Comunicacional
Datos Cliente Soporte Preventivo
Contacto Solicitante
Prioridad
Rut Cliente Soporte Preventivo
Nombre Cliente Soporte Preventivo
Responsable Soporte
```

### `INFO_TICKETS_SOPORTE`

Hoja normalizada preparada, pero sin registros.

- Filas: 1
- Columnas: 17

Encabezados:

```txt
ticket_id
fecha_creacion
fecha_modificacion
fecha_solicitud
hora_inicio
hora_termino
cli_rut
cli_nombre
contacto_cliente
email_contacto
telefono_contacto
ubicacion_id
mod_id
tipo_ticket_id
usr_responsable_id
estado_ticket
observacion
```

## Catalogos disponibles

La planilla incluye catalogos utiles para mapear el futuro Helpdesk:

- `INFO_EMPRESAS`
- `INFO_TIPO_INCIDENTE`
- `INFO_MODO_SOPORTE`
- `INFO_ESTADO_TICKET`
- `INFO_CANAL_COMUNICACIONAL`
- `INFO_HERRAMIENTAS`
- `INFO_ESTADO_LINEA_TIEMPO`
- `INFO_CONTRATO`
- `INFO_UBICACION`
- `INFO_PRODUCTOS`
- `INFO_CONTACTOS`

## Decision recomendada

No usar `INFO_TICKETS` para escritura automatica.

La planilla ya esta en uso operativo y necesita conservar sus datos registrados.
Por eso, la escritura automatica debe ir a:

```txt
INFO_TICKETS_SOPORTE
```

`INFO_TICKETS` queda como historico principal y referencia. `INFO_TICKETS_SOPORTE`
queda como hoja controlada para recibir tickets desde Gmail y desde el flujo
temporal.

La escritura debe realizarse mediante Apps Script dentro de la planilla. El
backend de `c2c-soporte` solo envia un payload JSON al Web App de Apps Script.
Con esto:

- no se toca `INFO_TICKETS`,
- no se requiere escribir el archivo `.xlsx` local,
- no se expone la planilla a ediciones directas desde Node,
- la planilla mantiene su propia logica de validacion y append,
- Apps Script puede deduplicar por `message_id_gmail`.

## Arquitectura temporal recomendada

```txt
Gmail -> backend c2c-soporte -> Apps Script Web App -> INFO_TICKETS_SOPORTE
```

Responsabilidades:

- Backend: lee Gmail, normaliza datos, envia JSON.
- Apps Script: valida token compartido, verifica duplicados y agrega fila.
- Planilla: conserva historico y permite uso operativo mientras termina el aplicativo.

## Seguridad minima Apps Script

- Guardar la URL del Web App en `backend/.env`.
- Usar un token compartido en header o payload.
- No versionar la URL privada ni el token.
- Apps Script debe rechazar requests sin token correcto.
- Apps Script debe buscar `message_id_gmail` antes de insertar.

Variables sugeridas:

```txt
GOOGLE_SHEETS_HELPDESK_ENABLED=false
GOOGLE_SHEETS_HELPDESK_WEBAPP_URL=
GOOGLE_SHEETS_HELPDESK_TOKEN=
```

La plantilla base de Apps Script queda en:

```txt
scripts/google-apps-script/helpdesk-gmail-webapp.gs
```

El comando backend para enviar el primer correo a `INFO_TICKETS_SOPORTE` queda:

```powershell
cd C:\RODPROJECTSCODEX\workspace\c2c-soporte\backend
npm run gmail:send-sheet -- --max 1 --query "subject:\"PRUEBA HELPDESK C2C\"" --requested-by soporte-local
```

Antes del envio real, se puede revisar el payload sin escribir en la planilla:

```powershell
npm run gmail:send-sheet -- --max 1 --query "subject:\"PRUEBA HELPDESK C2C\"" --requested-by soporte-local --dry-run
```

Agregar columnas tecnicas al final para evitar duplicados y facilitar migracion posterior:

```txt
message_id_gmail
thread_id_gmail
gmail_id
origen_ingesta
fecha_ingesta
estado_ingesta
```

Si se desea no modificar estructura todavia, la columna 25 sin encabezado puede usarse como `message_id_gmail`, pero no es lo ideal porque deja poca trazabilidad.

## Mapeo Gmail -> INFO_TICKETS

| Gmail | Planilla |
|---|---|
| fecha recepcion | Marca temporal |
| from email | Direccion de correo electronico |
| correlativo local | Numero Item |
| fecha recepcion | Fecha Creacion Ticket |
| hora recepcion | Hora Creacion Ticket |
| rut detectado o vacio | Rut Cliente |
| empresa detectada o vacio | Nombre Cliente |
| fecha recepcion | Fecha Solicitud Ticket |
| hora recepcion | Hora Solicitud Ticket |
| asunto | Asunto Correo u Observacion Corta |
| `Solicitud` por defecto | Tipo de Soporte |
| `Remoto` por defecto | Modalidad Soporte |
| `Externo` por defecto | Tipo Incidente |
| `Abierto` por defecto | Estado Ticket |
| `Email` | Canal Comunicacional |
| nombre remitente | Contacto Solicitante |
| `Media` por defecto | Prioridad |
| Message-ID | message_id_gmail |
| threadId | thread_id_gmail |
| Gmail id | gmail_id |

## Query Gmail inicial

Para partir de forma conservadora:

```txt
in:inbox after:2026/02/01
```

Si la casilla tiene mucho ruido, usar una query mas especifica:

```txt
in:inbox after:2026/02/01 newer_than:90d
```

O una etiqueta dedicada:

```txt
label:C2C_HELPDESK_IMPORT after:2026/02/01
```

## Opciones de implementacion

### Opcion A - Google Sheets API directo

Recomendada despues de validar el primer envio de prueba.

Ventajas:

- Escribe directo en la planilla compartida.
- Evita descargar/subir archivos.
- Permite operacion compartida por soporte.

Costos:

- Requiere habilitar Google Sheets API.
- Requiere OAuth o service account con permisos sobre la planilla.
- Hay que cuidar permisos y secretos.

### Opcion B - XLSX local

Recomendada solo para prueba local o carga manual.

Ventajas:

- No requiere Google Sheets API.
- Permite validar columnas y datos sin tocar la planilla online.

Costos:

- No queda sincronizado automaticamente con Google Sheets.
- Requiere subir manualmente el archivo actualizado.
- Necesita dependencia o herramienta para escribir `.xlsx`.

### Opcion C - CSV para pegar/importar

Recomendada como primer paso pragmatico.

Ventajas:

- Menos riesgo.
- No requiere escribir la planilla original.
- Permite revisar registros antes de cargarlos.

Costos:

- Requiere pegado/importacion manual.
- No es automatizacion completa.

## Recomendacion de camino

1. Crear hoja `PRUEBA_GMAIL_IMPORT` en la planilla.
2. Crear un comando que lea Gmail y genere un CSV compatible con esa hoja de prueba.
3. Revisar manualmente el CSV.
4. Importar/pegar el CSV en `PRUEBA_GMAIL_IMPORT`.
5. Confirmar que `message_id_gmail` evita duplicados.
6. Si el resultado es correcto, pasar a Google Sheets API directo o mantener carga manual temporal.
7. Cuando el aplicativo este listo, migrar desde la planilla a `rr_gestion_soporte.helpdesk_*`.

## Columnas recomendadas para `INFO_TICKETS_SOPORTE`

```txt
fecha_recepcion
fecha_modificacion
fecha_solicitud
hora_inicio
hora_termino
cli_rut
cli_nombre
contacto_cliente
email_contacto
telefono_contacto
ubicacion_id
mod_id
tipo_ticket_id
usr_responsable_id
estado_ticket
observacion
message_id_gmail
thread_id_gmail
gmail_id
fecha_ingesta
estado_ingesta
```

Las primeras columnas respetan la hoja `INFO_TICKETS_SOPORTE` existente. Las
columnas tecnicas finales se agregan para trazabilidad y deduplicacion.

Si no se quiere agregar columnas tecnicas visibles, Apps Script debe mantener
una hoja oculta de control, por ejemplo:

```txt
CONTROL_GMAIL_IMPORT
```

Pero la recomendacion es dejar `message_id_gmail`, `thread_id_gmail` y
`gmail_id` visibles al menos durante la validacion.

## Primer envio de prueba

El primer envio debe ser pequeno:

```txt
maxResults = 1
query = in:inbox after:2026/02/01
```

Si se quiere aun mas control, enviar primero un correo con asunto reconocible y
buscarlo de forma explicita:

```txt
subject:"PRUEBA HELPDESK C2C"
```

Resultado esperado:

- Se agrega una fila en `INFO_TICKETS_SOPORTE`.
- `estado_ticket` queda como `Abierto`.
- `message_id_gmail` queda informado.
- Una segunda ejecucion con el mismo correo no debe crear una fila nueva.

## Criterios de cierre

- No duplicar correos por `message_id_gmail`.
- No versionar la planilla con datos sensibles.
- Mantener el historico de febrero 2026 hacia atras intacto.
- Registrar nuevos correos en `INFO_TICKETS_SOPORTE` con estado `Abierto`.
- Dejar trazabilidad suficiente para migrar al aplicativo.

# Plan de objetivos Helpdesk v1

Fecha: 2026-05-20

## Objetivo

Ordenar el siguiente tramo de trabajo de `c2c-soporte` para convertir la Mesa de Ayuda en un modulo operativo usable por soporte, manteniendo el contrato del orquestador y evitando mezclar cambios de otros proyectos.

## Contexto verificado

El proyecto esta registrado en Project Control Center:

- Ruta: `C:\RODPROJECTSCODEX\workspace\c2c-soporte`
- Frontend: `http://localhost:5490`
- Backend: `http://localhost:5491`
- PostgreSQL local: `localhost:5492`, base `soporte`
- Repositorio: `https://github.com/weomendez-wq/c2chelpdesk.git`

El orquestador queda como punto obligatorio de arranque para cualquier agente:

1. Leer `C:\RODCONFIGALLPROJECTS\AGENTS.md`.
2. Leer `C:\RODCONFIGALLPROJECTS\config\projects.json`.
3. Ejecutar o revisar `npm run check` desde `C:\RODCONFIGALLPROJECTS`.
4. Confirmar proyecto, puertos, health, deep health y estado Git antes de operar.

## Reglas permanentes

- No ejecutar acciones de escritura, eliminacion, actualizacion, bloqueo, mantenimiento ni DDL contra `public`.
- No versionar secretos ni credenciales Gmail.
- Toda persistencia Helpdesk debe vivir en `rr_gestion_soporte.helpdesk_*`.
- Documentar antes de cambios importantes de arquitectura, flujo o datos.
- Mantener commits separados por intencion.

## Estado actual

### Cumplido

- Orquestador creado y activo.
- `c2c-soporte` registrado en pool `5490-5499`.
- Backend con `health` y `deepHealth`.
- Base local `soporte` disponible en PostgreSQL `5492`.
- Modulos operativos iniciales: Torre de Control, Empresas, Devices, Documentos, Folios/CAF, Rangos SII, Alertas y Mantenedores.
- Mesa de Ayuda inicial con ingreso manual externo.
- Modelo local Helpdesk definido.
- Ingesta simulada de correo implementada.
- Gmail definido como canal real.
- Sincronizacion Gmail implementada por endpoint, comando local y boton UI manual.

### Pendiente relevante

- Probar Gmail real con OAuth y casilla de soporte.
- Ordenar visualmente Mesa de Ayuda como modulo independiente.
- Agregar detalle de ticket, timeline y cambios de estado.
- Completar mantenedores propios de Helpdesk.
- Dejar pruebas guiadas para validar el flujo completo.
- Revisar archivos ajenos del workspace que no pertenecen a `c2c-soporte`.

## Plan de avance

### 1. Cierre de contexto y contrato

Objetivo: asegurar que cada nueva sesion parte desde un estado claro.

Tareas:

- Revisar `npm run check` del orquestador.
- Confirmar que `c2c-soporte` no tiene cambios pendientes propios antes de iniciar una nueva etapa.
- Separar o ignorar artefactos ajenos al proyecto solo si corresponde y con confirmacion.
- Registrar desviaciones en bitacora cuando el orquestador detecte warning o error.

Criterio de cierre:

- Orquestador sin bloqueos.
- Cambios propios del proyecto documentados y commiteados.
- Archivos ajenos identificados y fuera del alcance.

### 2. Validacion operacional Gmail

Objetivo: confirmar que el canal de correo genera tickets reales de forma controlada.

Tareas:

- Configurar variables locales OAuth fuera del repositorio.
- Ejecutar primero el comando:

```powershell
cd C:\RODPROJECTSCODEX\workspace\c2c-soporte\backend
npm run gmail:sync -- --max 10 --requested-by soporte-local
```

- Luego ejecutar la sincronizacion desde la UI.
- Confirmar deduplicacion por `message_id`.
- Confirmar trazabilidad en `rr_gestion_soporte.helpdesk_email_message`.

Criterio de cierre:

- Un correo nuevo crea un ticket.
- Un correo repetido no duplica ticket.
- Gmail deshabilitado muestra error controlado.
- No se escriben datos fuera de `rr_gestion_soporte.helpdesk_*`.

### 3. Mesa de Ayuda v1

Objetivo: pasar desde formulario inicial a modulo real de gestion.

Tareas:

- Crear vista principal de tickets con filtros claros.
- Crear detalle de ticket.
- Agregar timeline de eventos.
- Permitir cambio de estado.
- Permitir cambio de prioridad.
- Permitir asignacion inicial a responsable.

Criterio de cierre:

- Un usuario de soporte puede abrir, revisar, actualizar y cerrar un ticket sin salir del modulo.

### 4. Mantenedores Helpdesk

Objetivo: evitar valores libres y preparar operacion ordenada.

Tareas:

- Mantenedor de responsables.
- Mantenedor de categorias.
- Mantenedor de canales.
- Mantenedor de tipos de soporte.
- Mantenedor de prioridades y reglas de SLA iniciales.

Criterio de cierre:

- Los tickets usan catalogos controlados.
- Las acciones quedan auditadas.

### 5. Diseno UX

Objetivo: hacer el sistema usable para soporte, no solo informativo.

Tareas:

- Separar visualmente Torre de Control y Mesa de Ayuda.
- Reorganizar sidebar por modulos.
- Usar cards KPI compactas.
- Mejorar tablas con filtros, loading states y empty states.
- Evitar pantallas saturadas.

Criterio de cierre:

- El usuario puede identificar rapidamente donde revisar monitoreo, donde gestionar tickets y donde configurar mantenedores.

### 6. Pruebas guiadas

Objetivo: validar el flujo con casos reales y registrar observaciones.

Casos minimos:

- Ticket manual externo.
- Correo Gmail nuevo.
- Correo Gmail duplicado.
- Ticket asociado a empresa.
- Cambio de prioridad.
- Cambio de estado.
- Cierre de ticket.

Criterio de cierre:

- Cada caso tiene resultado esperado, resultado observado y decision de ajuste.

## Decision de producto

La Mesa de Ayuda va a crecer de forma gradual. Primero se asegura trazabilidad y orden operativo; despues se agregan automatizaciones, integraciones y vistas mas avanzadas. Esta estrategia evita construir una UI grande antes de confirmar que los datos, tickets y canales estan funcionando correctamente.


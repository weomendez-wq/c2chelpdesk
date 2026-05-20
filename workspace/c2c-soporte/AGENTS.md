<!-- ORCHESTRATOR-LINKED v1 -->
<!-- orchestrator: C:\RODCONFIGALLPROJECTS -->
<!-- project: c2c-soporte -->
<!-- generated: 2026-05-20T05:17:43.223Z -->

# AGENTS.md — c2c-soporte

> ## ⚠️ ARRANQUE OBLIGATORIO — NO OMITIR
>
> Este proyecto se gobierna desde el **Orquestador de Proyectos**:
>
> ```
> C:\RODCONFIGALLPROJECTS
> ```
>
> Antes de CUALQUIER acción (leer, editar, ejecutar, diagnosticar, reiniciar),
> el agente / IDE / sesión / nube DEBE:
>
> 1. Leer `C:\RODCONFIGALLPROJECTS\AGENTS.md`
> 2. Leer `C:\RODCONFIGALLPROJECTS\config\projects.json`
> 3. Leer `C:\RODCONFIGALLPROJECTS\docs\04-protocolo-arranque.md`
> 4. Identificarse como el proyecto **c2c-soporte**
> 5. Verificar puertos y servicios (`npm run check` en el orquestador)
>
> Recién después de los pasos 1-5 está permitido operar sobre este proyecto.

---

## Identidad del proyecto

- **Nombre**: c2c-soporte
- **Ruta oficial**: C:\RODPROJECTSCODEX\workspace\c2c-soporte
- **Frontend**: 5173
- **Backend**: 3000
- **Base de datos**: 5434
- **Registrado en orquestador**: sí

---

## Regla de oro

Si este archivo y `config/projects.json` del orquestador **discrepan**,
manda **`projects.json`**. Este archivo es un puntero, no la fuente de verdad.

---

## Restricciones (heredadas del protocolo)

- No ejecutar acciones destructivas sin autorización explícita.
- No modificar bases de datos productivas.
- No ocupar puertos fuera de la decena asignada a este proyecto.
- No mover el proyecto de carpeta sin actualizar `projects.json`.
- No mostrar secretos, tokens ni passwords.

---

## Documentación específica del proyecto

A partir de aquí, cada proyecto agrega su propio contenido (stack, comandos,
arquitectura, etc.). El bloque de arriba **no se borra ni se edita**: es el
contrato con el orquestador.

<!-- === CONTENIDO ESPECÍFICO DEL PROYECTO DEBAJO DE ESTA LÍNEA === -->

# Instrucciones para C2C Soporte

- Responder siempre en espanol.
- Explicar cada cambio antes de realizarlo y por que.
- Ante errores, explicar primero la causa antes de corregir.
- Mantener `public` productivo como solo lectura.
- No ejecutar `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `DROP`, `ALTER`, `CREATE`, `GRANT` ni `REVOKE` sobre `public` productivo.
- Regla critica reforzada: no ejecutar ninguna accion de escritura, eliminacion, actualizacion, bloqueo, permisos, DDL, mantenimiento destructivo o funcion con efectos laterales contra `public`.
- Esto aplica tambien a scripts historicos, funciones recicladas, vistas materializadas, queries generadas y pruebas manuales.
- La informacion operacional de 2026 debe consultarse desde los objetos locales ya migrados: `staging_public.*` y `rr_gestion_soporte.*`.
- Antes de consultas pesadas usar `EXPLAIN (FORMAT JSON)`.
- Usar `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` solo despues de revisar el plan.
- Documentar cambios importantes antes de modificar codigo o SQL.
- No tocar credenciales ni archivos `.env` sin autorizacion.
- No mover carpetas ni reorganizar estructura sin revisar el arbol.

## Proyecto

Proyecto objetivo: C2C Soporte / DTE / Torre de Control.

## Stack esperado

- Backend: Node.js + Express.
- Frontend: React + Vite + Tailwind.
- Base de datos: PostgreSQL.
- Observabilidad: logs estructurados, requestId, metricas y trazabilidad.

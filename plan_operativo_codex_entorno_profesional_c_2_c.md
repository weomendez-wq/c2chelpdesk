# PLAN OPERATIVO PROFESIONAL

## Plataforma C2C Soporte / DTE / Torre de Control

---

# 1. OBJETIVO GENERAL

Construir una base profesional, estable y segura para el ecosistema:

* Backend Node.js + Express
* Frontend React + Vite + Tailwind
* PostgreSQL
* Analítica DTE
* Torre de Control
* Observabilidad
* Métricas
* Materialized Views
* Multi-tenant
* Monitoreo de dispositivos y CAF

El foco principal inicial será:

1. Ordenar arquitectura.
2. Profesionalizar el entorno.
3. Implementar seguridad operacional SQL.
4. Crear ambiente local controlado.
5. Consolidar capa analítica.
6. Preparar la Torre de Control.

---

# 2. REGLAS CRÍTICAS DEL PROYECTO

## 2.1 REGLAS SOBRE BASE DE DATOS PRODUCTIVA

### ESQUEMA PUBLIC = SOLO LECTURA

Está estrictamente prohibido ejecutar sobre `public`:

* INSERT
* UPDATE
* DELETE
* TRUNCATE
* DROP
* ALTER
* CREATE
* GRANT
* REVOKE

## SOLO SE PERMITE:

* SELECT
* EXPLAIN
* EXPLAIN (FORMAT JSON)
* EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
* consultas de estructura
* consultas de índices
* consultas de estadísticas

---

# 3. ESTRATEGIA DE ENTORNO LOCAL

## OBJETIVO

Crear una base local de trabajo:

```sql
soporte
```

La base `soporte` será el ambiente oficial de desarrollo y pruebas.

---

# 4. ESTRUCTURA OBJETIVO DE BASE DE DATOS

## 4.1 ESQUEMAS

### staging_public

Contendrá:

* copia local de estructuras
* copia local de datos controlados
* staging
* snapshots

### rr_gestion_soporte

Contendrá:

* views
* materialized views
* analytics
* métricas
* funciones helper
* tablas derivadas
* tablas de control
* tablas de logging
* dashboards

---

# 5. ESTRATEGIA DE COPIA DE DATOS

## TABLAS A COPIAR COMPLETAS

### Tablas:

* todas las tablas y sus datos, exeptuando documentos.

---

## TABLA DOCUMENTOS

### REGLA CRÍTICA

NO copiar tabla completa.

## SOLO:

Desde enero del año actual hasta la fecha.

---

# 6. FLUJO PROFESIONAL OBLIGATORIO PARA QUERIES

## ANTES DE EJECUTAR QUERIES PESADAS

Siempre:

```sql
EXPLAIN (FORMAT JSON)
```

Analizar:

* costo
* filas estimadas
* índices
* Seq Scan
* tiempo estimado
* buffers
* joins

---

## SOLO DESPUÉS

Si el análisis es seguro:

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
```

---

# 7. WORKSPACE PRINCIPAL

## Workspace actual de trabajo

```txt
C:\RODPROJECTS\applab
```

## Otros paths históricos relacionados

```txt
C:\C2C\PROYECTOS\SOPORTE C2C\APP_GESTION_FOLIOS
C:\C2C\C2CPROJECTS\RESPALDOSPROYECTOSALL
```

---

# 8. ESTRUCTURA PROFESIONAL OBJETIVO

## BACKEND

```txt
backend/
 ├── src/
 │   ├── app/
 │   ├── config/
 │   ├── modules/
 │   ├── shared/
 │   ├── middlewares/
 │   ├── services/
 │   ├── repositories/
 │   ├── routes/
 │   ├── validators/
 │   ├── utils/
 │   └── jobs/
```

---

## FRONTEND

```txt
frontend/
 ├── src/
 │   ├── app/
 │   ├── components/
 │   ├── modules/
 │   ├── pages/
 │   ├── shared/
 │   ├── hooks/
 │   ├── services/
 │   ├── adapters/
 │   ├── layouts/
 │   └── context/
```

---

# 9. RESPONSABILIDADES

| Responsable | Área                   | Responsabilidad                  |
| ----------- | ---------------------- | -------------------------------- |
| Rodrigo     | Arquitectura funcional | Validar reglas de negocio        |
| Rodrigo     | Validación SQL         | Aprobar queries pesadas          |
| Codex       | Generación de código   | Implementación controlada        |
| Codex       | Refactor controlado    | Mejoras sin romper módulos       |
| Codex       | Diagnóstico            | Análisis técnico inicial         |
| Codex       | SQL seguro             | Generación de EXPLAIN y análisis |
| Backend     | Observabilidad         | Logs y requestId                 |
| Frontend    | UX/UI                  | Componentización y dashboard     |

---

# 10. FASES DEL PROYECTO

# FASE 1

# Profesionalización del entorno

## Objetivo

Dejar:

* Git estable
* ramas controladas
* Codex configurado
* contexto documentado
* reglas SQL establecidas
* entorno local funcional

---

## Tareas

| ID    | Tarea                               | Responsable     | Tiempo Estimado | Dependencia | Paralelizable |
| ----- | ----------------------------------- | --------------- | --------------- | ----------- | ------------- |
| F1-01 | Crear rama Git principal de trabajo | Rodrigo         | 15 min          | Ninguna     | Sí            |
| F1-02 | Crear carpeta docs/codex            | Rodrigo         | 10 min          | F1-01       | Sí            |
| F1-03 | Crear PROJECT_CONTEXT.md            | Rodrigo + Codex | 45 min          | F1-02       | No            |
| F1-04 | Configurar prompts base Codex       | Rodrigo         | 30 min          | F1-03       | Sí            |
| F1-05 | Configurar ESLint y estructura base | Codex           | 1 hora          | F1-03       | Sí            |
| F1-06 | Validar estructura actual proyecto  | Codex           | 1 hora          | F1-03       | Sí            |
| F1-07 | Diagnóstico técnico completo        | Codex           | 2 horas         | F1-06       | No            |

---

# FASE 2

# Base de datos local soporte

## Objetivo

Construir ambiente local seguro y controlado.

---

## Tareas

| ID    | Tarea                                             | Responsable     | Tiempo Estimado | Dependencia | Paralelizable |
| ----- | ------------------------------------------------- | --------------- | --------------- | ----------- | ------------- |
| F2-01 | Crear DB soporte                                  | Rodrigo         | 15 min          | F1          | Sí            |
| F2-02 | Crear schemas staging_public y rr_gestion_soporte | Codex           | 20 min          | F2-01       | Sí            |
| F2-03 | Inspeccionar estructura public                    | Codex           | 1 hora          | F2-02       | No            |
| F2-04 | Analizar índices de documentos                    | Codex           | 1 hora          | F2-03       | No            |
| F2-05 | Crear scripts copia tablas pequeñas               | Codex           | 1 hora          | F2-03       | Sí            |
| F2-06 | Crear estrategia copia documentos enero-fecha     | Codex           | 2 horas         | F2-04       | No            |
| F2-07 | Ejecutar EXPLAIN de extracción documentos         | Rodrigo + Codex | 1 hora          | F2-06       | No            |
| F2-08 | Crear índices locales                             | Codex           | 1 hora          | F2-07       | Sí            |
| F2-09 | Validar volumen local                             | Rodrigo         | 30 min          | F2-08       | No            |

---

# FASE 3

# Seguridad SQL y observabilidad

## Objetivo

Construir módulo profesional de análisis SQL.

---

## Tareas

| ID    | Tarea                                 | Responsable | Tiempo Estimado | Dependencia | Paralelizable |
| ----- | ------------------------------------- | ----------- | --------------- | ----------- | ------------- |
| F3-01 | Crear endpoint /api/admin/sql/explain | Codex       | 1 hora          | F2          | Sí            |
| F3-02 | Crear validador Zod SQL               | Codex       | 45 min          | F3-01       | Sí            |
| F3-03 | Bloquear comandos peligrosos          | Codex       | 45 min          | F3-01       | Sí            |
| F3-04 | Implementar EXPLAIN FORMAT JSON       | Codex       | 1 hora          | F3-01       | No            |
| F3-05 | Detectar Seq Scan                     | Codex       | 1 hora          | F3-04       | No            |
| F3-06 | Agregar logger estructurado           | Codex       | 1 hora          | F3-04       | Sí            |
| F3-07 | Agregar requestId                     | Codex       | 45 min          | F3-06       | Sí            |
| F3-08 | Agregar tenantId middleware           | Codex       | 45 min          | F3-06       | Sí            |
| F3-09 | Estandarizar responses API            | Codex       | 1 hora          | F3-06       | No            |

---

# FASE 4

# Consolidación backend

## Objetivo

Normalizar arquitectura backend.

---

## Tareas

| ID    | Tarea                       | Responsable | Tiempo Estimado |
| ----- | --------------------------- | ----------- | --------------- |
| F4-01 | Revisar módulos empresa     | Codex       | 2 horas         |
| F4-02 | Revisar módulos caf         | Codex       | 2 horas         |
| F4-03 | Revisar módulos device      | Codex       | 2 horas         |
| F4-04 | Revisar módulos admin       | Codex       | 2 horas         |
| F4-05 | Detectar código duplicado   | Codex       | 2 horas         |
| F4-06 | Crear helpers reutilizables | Codex       | 2 horas         |
| F4-07 | Centralizar filtros SQL     | Codex       | 2 horas         |
| F4-08 | Revisar axios frontend      | Codex       | 1 hora          |
| F4-09 | Revisar adapters frontend   | Codex       | 1 hora          |

---

# FASE 5

# Consolidación analítica

## Objetivo

Centralizar analítica en views y materialized views.

---

## Objetivos técnicos

* NO consumir public.documentos desde frontend
* centralizar métricas
* mejorar rendimiento
* facilitar dashboards

---

## Tareas

| ID    | Tarea                                  | Responsable | Tiempo Estimado |
| ----- | -------------------------------------- | ----------- | --------------- |
| F5-01 | Consolidar mv_folioctl_documentos_365d | Codex       | 2 horas         |
| F5-02 | Consolidar analytics CAF               | Codex       | 3 horas         |
| F5-03 | Consolidar métricas dispositivos       | Codex       | 3 horas         |
| F5-04 | Crear métricas globales tenants        | Codex       | 2 horas         |
| F5-05 | Crear métricas emisión diaria          | Codex       | 2 horas         |
| F5-06 | Crear ranking empresas                 | Codex       | 2 horas         |
| F5-07 | Crear ranking dispositivos             | Codex       | 2 horas         |
| F5-08 | Crear indicadores CAF críticos         | Codex       | 3 horas         |

---

# FASE 6

# Torre de Control

## Objetivo

Construir dashboard global operacional.

---

## KPIs

* empresas activas
* documentos hoy
* documentos 30 días
* dispositivos críticos
* CAF bajo mínimo
* emisiones diarias
* top empresas
* top dispositivos

---

## Tareas

| ID    | Tarea                                 | Responsable | Tiempo Estimado |
| ----- | ------------------------------------- | ----------- | --------------- |
| F6-01 | Crear endpoint global-support-summary | Codex       | 2 horas         |
| F6-02 | Crear endpoint global-health          | Codex       | 2 horas         |
| F6-03 | Crear cards KPI frontend              | Codex       | 3 horas         |
| F6-04 | Crear gráficos emisión diaria         | Codex       | 3 horas         |
| F6-05 | Crear tablas ranking                  | Codex       | 2 horas         |
| F6-06 | Crear alertas críticas                | Codex       | 2 horas         |
| F6-07 | Crear filtros globales                | Codex       | 2 horas         |
| F6-08 | Crear exportaciones                   | Codex       | 3 horas         |

---

# FASE 7

# Frontend profesional

## Objetivo

Unificar UX/UI.

---

## Tareas

| ID    | Tarea                           | Responsable | Tiempo Estimado |
| ----- | ------------------------------- | ----------- | --------------- |
| F7-01 | Unificar layouts                | Codex       | 2 horas         |
| F7-02 | Crear tabla reutilizable        | Codex       | 4 horas         |
| F7-03 | Crear paginación estándar       | Codex       | 2 horas         |
| F7-04 | Crear filtros reutilizables     | Codex       | 2 horas         |
| F7-05 | Crear loaders/skeletons         | Codex       | 2 horas         |
| F7-06 | Revisar responsive              | Codex       | 3 horas         |
| F7-07 | Revisar estados vacíos          | Codex       | 1 hora          |
| F7-08 | Revisar manejo errores frontend | Codex       | 2 horas         |

---

# 11. FLUJO OPERACIONAL CON CODEX

## PASO 1

Solicitar diagnóstico.

```text
Analiza el proyecto completo. No modifiques archivos todavía.
```

---

## PASO 2

Revisar plan.

---

## PASO 3

Solicitar cambios pequeños.

```text
Implementa solo FASE 1.
```

---

## PASO 4

Revisar:

```bash
git diff
```

---

## PASO 5

Probar:

```bash
npm run dev
```

---

## PASO 6

Commit:

```bash
git add .
git commit -m "feat: sql analyzer"
```

---

# 12. ORDEN RECOMENDADO PARA ESTE FIN DE SEMANA

# SÁBADO

## BLOQUE 1

* Git
* ramas
* documentación
* prompts Codex
* PROJECT_CONTEXT

## BLOQUE 2

* DB soporte
* schemas
* copia controlada
* EXPLAIN SQL

## BLOQUE 3

* endpoint SQL seguro
* observabilidad
* logger
* requestId

---

# DOMINGO

## BLOQUE 4

* consolidación backend
* métricas
* views
* materialized views

## BLOQUE 5

* Torre de Control
* KPIs
* rankings
* alertas

## BLOQUE 6

* UX frontend
* tablas
* layouts
* filtros
* loaders

---

# 12.1 PLAN SECUENCIAL PARA ORDENAR C:/RODPROJECTSCODEX

## Objetivo

Transformar `C:/RODPROJECTSCODEX` en un workspace maestro para proyectos asistidos por Codex, con contexto global, proyectos separados, documentación estándar, bitácoras, reglas de seguridad y base preparada para automatización futura.

---

## ETAPA 0 - Validación inicial

| ID    | Tarea                                                                       | Responsable   | Tiempo | Resultado                            |
| ----- | --------------------------------------------------------------------------- | ------------- | ------ | ------------------------------------ |
| E0-01 | Confirmar que `C:/RODPROJECTSCODEX` será la carpeta raíz de proyectos Codex | Rodrigo       | 5 min  | Ruta oficial definida                |
| E0-02 | Revisar árbol actual con `tree`                                             | Rodrigo       | 5 min  | Estado inicial confirmado            |
| E0-03 | Crear respaldo manual o commit si aplica                                    | Rodrigo       | 15 min | Punto seguro antes de mover carpetas |
| E0-04 | No modificar todavía proyectos internos                                     | Rodrigo/Codex | 5 min  | Riesgo controlado                    |

---

## ETAPA 1 - Crear estructura global del workspace

Estructura recomendada:

```txt
C:/RODPROJECTSCODEX
├── .codex
│   ├── agents
│   ├── contexts
│   ├── prompts
│   ├── templates
│   ├── rules
│   ├── standards
│   ├── scripts
│   └── environments
├── shared-docs
│   ├── arquitectura
│   ├── postgresql
│   ├── nodejs
│   ├── react
│   ├── tailwind
│   ├── observabilidad
│   ├── seguridad
│   └── sql-performance
├── templates
├── sandbox
├── logs
├── workspace
│   ├── asistente-ingles-personal
│   └── c2c-soporte
└── README_GLOBAL.md
```

Tareas:

| ID    | Tarea                               | Responsable | Tiempo | Paralela | Automatizable |
| ----- | ----------------------------------- | ----------- | ------ | -------- | ------------- |
| E1-01 | Crear carpetas internas de `.codex` | Codex       | 10 min | Sí       | Sí            |
| E1-02 | Crear `shared-docs`                 | Codex       | 10 min | Sí       | Sí            |
| E1-03 | Crear `templates`                   | Codex       | 5 min  | Sí       | Sí            |
| E1-04 | Crear `sandbox`                     | Codex       | 5 min  | Sí       | Sí            |
| E1-05 | Crear `logs`                        | Codex       | 5 min  | Sí       | Sí            |
| E1-06 | Crear `workspace`                   | Codex       | 5 min  | Sí       | Sí            |

---

## ETAPA 2 - Crear contexto global IA

Archivo recomendado:

```txt
C:/RODPROJECTSCODEX/.codex/contexts/GLOBAL_CONTEXT.md
```

Debe contener:

* idioma español obligatorio
* perfil de trabajo de Rodrigo
* preferencias de explicación paso a paso
* regla de explicar causas antes de corregir
* control de cambios con Git
* documentación antes de cambios importantes
* prohibición de cambios destructivos
* reglas SQL globales
* stack frecuente: Node, Express, PostgreSQL, React, Vite, Tailwind
* criterios de arquitectura mantenible
* criterios de observabilidad

Tareas:

| ID    | Tarea                           | Responsable | Tiempo | Resultado                           |
| ----- | ------------------------------- | ----------- | ------ | ----------------------------------- |
| E2-01 | Crear `GLOBAL_CONTEXT.md`       | Codex       | 30 min | Contexto global creado              |
| E2-02 | Agregar reglas de comunicación  | Codex       | 15 min | Respuestas en español y paso a paso |
| E2-03 | Agregar reglas de seguridad     | Codex       | 20 min | Cambios riesgosos bloqueados        |
| E2-04 | Agregar reglas SQL              | Codex       | 30 min | `public` tratado como solo lectura  |
| E2-05 | Agregar flujo Git/documentación | Codex       | 20 min | Proceso profesional definido        |

---

## ETAPA 3 - Crear plantilla estándar para proyectos

Ubicación recomendada:

```txt
C:/RODPROJECTSCODEX/.codex/templates/project-standard
```

Estructura mínima por proyecto:

```txt
nombre-proyecto
├── AGENTS.md
├── README.md
├── CHANGELOG.md
├── docs
│   ├── 00-vision.md
│   ├── 01-arquitectura.md
│   ├── 02-backend.md
│   ├── 03-frontend.md
│   ├── 04-sql.md
│   ├── 05-observabilidad.md
│   ├── 06-roadmap.md
│   └── bitacora
├── backend
├── frontend
├── database
├── scripts
└── infra
```

Tareas:

| ID    | Tarea                                 | Responsable | Tiempo | Resultado                           |
| ----- | ------------------------------------- | ----------- | ------ | ----------------------------------- |
| E3-01 | Crear template base de proyecto       | Codex       | 1 h    | Estructura reutilizable             |
| E3-02 | Crear `AGENTS.template.md`            | Codex       | 45 min | Instrucciones estándar para agentes |
| E3-03 | Crear docs base vacíos                | Codex       | 45 min | Documentación inicial estándar      |
| E3-04 | Crear formato de bitácora             | Codex       | 30 min | Continuidad entre sesiones          |
| E3-05 | Crear formato de respuesta del agente | Codex       | 30 min | Reportes uniformes                  |

---

## ETAPA 4 - Integrar proyecto actual `asistente-ingles-personal`

Ruta recomendada:

```txt
C:/RODPROJECTSCODEX/workspace/asistente-ingles-personal
```

Proceso recomendado:

1. Validar que el proyecto funciona en su ubicación actual.
2. Crear `workspace` si no existe.
3. Mover el proyecto completo a `workspace/asistente-ingles-personal`.
4. Crear `AGENTS.md` propio del proyecto.
5. Crear o completar `README.md`.
6. Crear `CHANGELOG.md`.
7. Crear `docs/00-vision.md`.
8. Crear `docs/01-arquitectura.md`.
9. Crear bitácora inicial.
10. Ejecutar instalación/prueba del proyecto.

Tareas:

| ID    | Tarea                          | Responsable   | Tiempo | Dependencia     |
| ----- | ------------------------------ | ------------- | ------ | --------------- |
| E4-01 | Revisar scripts del proyecto   | Codex         | 20 min | Proyecto actual |
| E4-02 | Mover carpeta a `workspace`    | Rodrigo       | 15 min | E1              |
| E4-03 | Crear `AGENTS.md` específico   | Codex         | 45 min | E4-02           |
| E4-04 | Crear documentación mínima     | Codex         | 1 h    | E4-03           |
| E4-05 | Crear bitácora inicial         | Codex         | 20 min | E4-04           |
| E4-06 | Probar instalación y ejecución | Rodrigo/Codex | 30 min | E4-05           |

---

## ETAPA 5 - Preparar proyecto C2C Soporte / DTE

Ruta recomendada:

```txt
C:/RODPROJECTSCODEX/workspace/c2c-soporte
```

Este proyecto debe incluir reglas especiales:

* `public` es solo lectura.
* No ejecutar INSERT, UPDATE, DELETE, TRUNCATE, DROP ni ALTER sobre `public`.
* Antes de queries pesadas usar `EXPLAIN (FORMAT JSON)`.
* La base local de trabajo debe llamarse `soporte`.
* Crear esquema `staging_public` para copia controlada.
* Crear esquema `rr_gestion_soporte` para objetos propios.
* Copiar `documentos` solo desde enero a la fecha.

Tareas:

| ID    | Tarea                       | Responsable   | Tiempo | Resultado                    |
| ----- | --------------------------- | ------------- | ------ | ---------------------------- |
| E5-01 | Crear carpeta `c2c-soporte` | Rodrigo/Codex | 10 min | Proyecto reservado           |
| E5-02 | Crear `AGENTS.md` C2C       | Codex         | 1 h    | Reglas críticas documentadas |
| E5-03 | Crear docs base C2C         | Codex         | 2 h    | Contexto del proyecto        |
| E5-04 | Crear carpeta `database`    | Codex         | 10 min | SQL ordenado                 |
| E5-05 | Crear scripts SQL base      | Codex         | 2 h    | Base local preparada         |
| E5-06 | Crear bitácora inicial      | Codex         | 20 min | Inicio trazable              |

---

## ETAPA 6 - Automatización inicial con PowerShell

Scripts recomendados:

```txt
C:/RODPROJECTSCODEX/.codex/scripts
├── init-workspace.ps1
├── init-project.ps1
├── create-bitacora.ps1
├── check-project.ps1
└── backup-project.ps1
```

Tareas:

| ID    | Tarea                       | Responsable | Tiempo | Automatizable |
| ----- | --------------------------- | ----------- | ------ | ------------- |
| E6-01 | Crear `init-workspace.ps1`  | Codex       | 1 h    | Sí            |
| E6-02 | Crear `init-project.ps1`    | Codex       | 2 h    | Sí            |
| E6-03 | Crear `create-bitacora.ps1` | Codex       | 1 h    | Sí            |
| E6-04 | Crear `check-project.ps1`   | Codex       | 1 h    | Sí            |
| E6-05 | Crear `backup-project.ps1`  | Codex       | 1 h    | Sí            |

---

## ETAPA 7 - Flujo diario obligatorio

Inicio de sesión:

1. Abrir terminal en el proyecto.
2. Ejecutar `git status`.
3. Leer `AGENTS.md`.
4. Leer `README.md`.
5. Leer `CHANGELOG.md`.
6. Leer última bitácora.
7. Pedir diagnóstico o tarea concreta a Codex.
8. No modificar código sin plan.

Cierre de sesión:

1. Revisar `git diff`.
2. Ejecutar pruebas disponibles.
3. Actualizar documentación.
4. Crear bitácora.
5. Hacer commit.
6. Registrar pendientes.

---

## ETAPA 8 - Orden recomendado de ejecución

### Día 1 - Workspace base

1. Crear respaldo.
2. Crear estructura global.
3. Crear `GLOBAL_CONTEXT.md`.
4. Crear plantilla `AGENTS.template.md`.
5. Integrar `asistente-ingles-personal`.

### Día 2 - Proyecto C2C

1. Crear `workspace/c2c-soporte`.
2. Crear `AGENTS.md` específico.
3. Crear docs base.
4. Crear scripts SQL iniciales.
5. Documentar reglas de base de datos.

### Día 3 - Automatización

1. Crear scripts PowerShell.
2. Crear validadores de estructura.
3. Crear generador de bitácora.
4. Crear flujo de inicialización de nuevos proyectos.
5. Documentar uso.

---

# 13. RESULTADO ESPERADO

Al finalizar:

✅ entorno profesional
✅ Codex configurado
✅ Git ordenado
✅ DB local soporte
✅ SQL seguro
✅ observabilidad
✅ backend estable
✅ analytics centralizados
✅ Torre de Control iniciada
✅ frontend consistente
✅ arquitectura mantenible

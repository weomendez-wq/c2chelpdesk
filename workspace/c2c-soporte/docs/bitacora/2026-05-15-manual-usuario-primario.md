# Bitacora - Manual usuario primario

## Fecha

2026-05-15

## Objetivo

Crear un manual inicial que permita validar frontend y backend funcionando en conjunto.

## Alcance

- Flujo Empresa -> Dispositivos.
- Preparacion local de backend y frontend.
- Casos de prueba funcional primaria.
- Matriz de comportamiento esperado.
- Formato de observaciones.
- Diagramas Mermaid para flujo general y validacion.

## Criterio

El manual queda en Markdown para mantenerlo versionado junto al codigo y poder revisarlo en VS Code o GitHub. Mas adelante puede exportarse a HTML, PDF o DOCX si se requiere un formato de entrega para usuarios finales.

## Observacion registrada

Durante la primera validacion del frontend se detecto error `500` en:

```txt
GET /api/support/company-devices?limit=100&offset=0
```

Diagnostico:

- Backend respondia `/api/health`.
- Puerto `5434` no aceptaba conexiones.
- Puerto `5432` estaba activo, pero correspondia a la base origen `dte` con usuario `master`.

Criterio:

- No cambiar `DATABASE_URL` a `5432` sin decision explicita.
- Primero levantar o recuperar PostgreSQL local `soporte` en `5434`.

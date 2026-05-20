# Bitacora: comando Gmail sync

**Fecha**: 2026-05-20

## Decision

Antes de exponer la sincronizacion Gmail en UI, se agrega un comando local para
validar OAuth, scopes, lectura de mensajes y creacion/deduplicacion de tickets.

## Comando objetivo

```powershell
cd C:\RODPROJECTSCODEX\workspace\c2c-soporte\backend
npm run gmail:sync -- --max 10 --requested-by soporte-local
```

## Criterio

- Primero consola, despues UI.
- Sin proceso automatico inicial.
- Sin secretos versionados.
- Si `GMAIL_ENABLED=false`, el comando debe terminar de forma controlada con
  codigo `GMAIL_DISABLED`.

## Pendiente posterior

Cuando el comando este validado con una casilla real, agregar boton en Mesa de
Ayuda para ejecutar la sincronizacion manual desde la interfaz.

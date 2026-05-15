# Workspace Codex Profesional

Este workspace organiza proyectos asistidos por Codex bajo una base comun de contexto, reglas, documentacion, plantillas y seguridad operacional.

## Ruta oficial

```txt
C:\RODPROJECTSCODEX
```

## Estado inicial verificado

- Repositorio Git raiz inicializado en `main`.
- Remoto configurado: `https://github.com/weomendez-wq/c2chelpdesk.git`.
- El remoto fue verificado con `git ls-remote` y no contiene refs.
- `asistente-ingles-personal` existe como proyecto independiente y no se mueve todavia.
- `c2c-soporte` queda reservado para una etapa posterior.

## Estructura global

```txt
.codex/
shared-docs/
templates/
sandbox/
logs/
workspace/
README_GLOBAL.md
```

## Flujo de trabajo

1. Revisar `README_GLOBAL.md`.
2. Revisar `.codex/contexts/GLOBAL_CONTEXT.md`.
3. Confirmar el arbol del workspace antes de mover proyectos.
4. Documentar antes de cambios importantes.
5. Hacer cambios pequenos y verificables.
6. Revisar `git diff`.
7. Ejecutar pruebas disponibles.
8. Registrar bitacora y commit.

## Regla importante

No se deben mover proyectos internos ni ejecutar cambios destructivos sin una validacion previa del arbol, respaldo o commit aplicable.


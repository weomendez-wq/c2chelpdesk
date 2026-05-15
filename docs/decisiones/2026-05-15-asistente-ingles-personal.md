# Decision - asistente-ingles-personal

## Contexto

`asistente-ingles-personal` existe dentro de `C:\RODPROJECTSCODEX`, pero ya tiene su propio repositorio Git, documentacion y estructura de aplicacion.

## Decision

Mantener `asistente-ingles-personal` fuera del repositorio maestro por ahora.

## Motivo

El repositorio maestro actual esta asociado a `c2chelpdesk`, por lo que mezclar el historial de un proyecto distinto puede confundir el alcance, los commits y la trazabilidad.

## Estado operativo

- El proyecto queda ignorado por `.gitignore`.
- No se mueve a `workspace/` en esta etapa.
- No se modifica su codigo ni su documentacion en este bloque.

## Criterio para revisar la decision

La decision se puede revisar cuando se defina si `C:\RODPROJECTSCODEX` funcionara como monorepo real o solo como workspace maestro con proyectos independientes.


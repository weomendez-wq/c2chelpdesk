# Scripts SQL por integrar

## Proposito

Esta carpeta contiene scripts heredados o exploratorios que deben analizarse antes de incorporarse al proyecto.

## Reglas

- No ejecutar directamente contra la base local.
- No ejecutar contra `public`.
- No eliminar archivos sin autorizacion explicita.
- No incorporar scripts con sentencias destructivas.
- Adaptar la logica a scripts nuevos versionados en `database/sql/`.

## Estado

Limpieza aplicada:

```txt
DROP removidos de todos los archivos .sql
```

Validacion:

```txt
DROP: 0 coincidencias
public: 0 coincidencias
```

Pendiente:

- Revisar `UPDATE`, `ALTER` y `ON CONFLICT DO UPDATE`.
- Adaptar referencias historicas como `documentos` y `gsoporte_*` a los objetos locales actuales.

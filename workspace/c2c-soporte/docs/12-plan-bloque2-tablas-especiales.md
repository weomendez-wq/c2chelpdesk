# Plan bloque 2 - Tablas especiales

## Objetivo

Definir una estrategia conservadora para tablas que no deben copiarse completas sin filtros o lotes.

## Estado base

El bloque 1 ya dejo 35 tablas copiadas en `soporte.staging_public`.

El bloque 2 contiene tablas con alto volumen, materialized views o dependencias por join:

| Relacion | Tipo | Estimacion | Tamano | Decision inicial |
| --- | --- | ---: | --- | --- |
| `sincronizacionsap` | tabla | 192903 | 35 MB | Copia completa candidata bloque 2A |
| `mv_device_operacion` | matview | 384 | 72 kB | Copia snapshot candidata bloque 2A |
| `contabilizaciondocs` | tabla | 6326644 | 2895 MB | Copia por ventana 2026 candidata |
| `documentos_fecha_normalizada` | matview | 36590120 | 2363 MB | Copia por ventana 2026 candidata |
| `documentos` | tabla | 38482288 | 67 GB | Solo con indice funcional y ventana controlada |
| `enviosiidocs` | tabla | 40106000 | 9588 MB | No copiar por join directo |
| `cierrecaja_documento` | tabla | 38069268 | 10 GB | No copiar por join completo |

## EXPLAIN revisado

Plantilla versionada:

```txt
database/sql/source-readonly/30-block2-explain-candidates.sql
```

Resultados relevantes del 2026-05-15:

- `sincronizacionsap` completo: `Seq Scan`, 192903 filas estimadas. Aceptable por tamano moderado.
- `contabilizaciondocs` 2026 por `fechaemision`: `Bitmap Heap Scan` usando `idx_contabilizaciondocs_composite`, 448666 filas estimadas.
- `documentos_fecha_normalizada` 2026 por `fecha`: `Index Only Scan` usando `idx_doc_norm_tenant_rut_fecha`, 1868423 filas estimadas.
- `documentos` 2026 por `fechaemision` directa: `Seq Scan`, 3809789 filas estimadas. No aprobado.
- `documentos` 2026 por `rr_gestion_soporte.fn_parse_dte_timestamp(fechaemision)`: `Index Scan` usando `idx_documentos_fechaemision_v2`, 3843956 filas estimadas. Candidato con ventana controlada.
- `enviosiidocs` unido a `documentos` 2026: `Hash Join` con `Seq Scan` sobre `enviosiidocs` de 40106000 filas. No aprobado.
- `cierrecaja_documento` unido a `cierrecaja`: `Merge Join`, 9532545 filas estimadas y recorrido grande sobre `cierrecaja_documento`. No aprobado como copia directa.

## Orden propuesto

### Bloque 2A

Copiar tablas pequenas o moderadas:

1. `sincronizacionsap` completa.
2. `mv_device_operacion` como snapshot local.

Generador:

```powershell
.\database\scripts\generate-copy-block2a.ps1
```

Ejecucion local completada el 2026-05-15 con artefactos en `database/generated/copy-block2a/20260515-031521`.

Resultado:

- Relaciones copiadas: 2.
- Filas origen: 193287.
- Filas locales: 193287.
- Diferencias por conteo: 0.

### Bloque 2B

Copiar `contabilizaciondocs` por ventana anual 2026 usando `fechaemision`.

Condicion candidata:

```sql
WHERE fechaemision >= '2026-01-01'
  AND fechaemision < '2027-01-01'
```

### Bloque 2C

Copiar `documentos_fecha_normalizada` por ventana anual 2026.

Condicion candidata:

```sql
WHERE fecha >= timestamp '2026-01-01'
  AND fecha < timestamp '2027-01-01'
```

### Bloque 2D

Copiar subconjunto de `documentos` solo si se usa el indice funcional `idx_documentos_fechaemision_v2`.

Condicion candidata:

```sql
WHERE rr_gestion_soporte.fn_parse_dte_timestamp(fechaemision) >= timestamp '2026-01-01'
  AND rr_gestion_soporte.fn_parse_dte_timestamp(fechaemision) < timestamp '2027-01-01'
```

No usar filtro directo por `fechaemision` porque produce `Seq Scan`.

### Pendientes

`enviosiidocs` y `cierrecaja_documento` requieren estrategia por lotes basada en llaves ya copiadas o necesidad funcional concreta. No se aprueba join directo contra origen porque los planes estiman recorridos masivos.

## Regla de seguridad

Antes de generar scripts de copia del bloque 2:

1. Ejecutar `EXPLAIN` con sesion read-only.
2. Confirmar que no haya `Seq Scan` masivo sobre tablas de decenas de millones.
3. Definir limite de filas esperado.
4. Exportar a CSV por bloque o ventana.
5. Validar conteos origen/local por tabla.

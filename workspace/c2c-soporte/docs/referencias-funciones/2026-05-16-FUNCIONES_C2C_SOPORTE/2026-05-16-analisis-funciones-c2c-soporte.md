# Analisis funciones C2C Soporte

## Fecha

2026-05-16

## Origen

```txt
C:\RODPROJECTSCODEX\layoutExample\FUNCIONES_C2C_SOPORTE
```

## Objetivo

Preservar y clasificar funciones SQL historicas que pueden aportar logica al proyecto actual sin ejecutar codigo antiguo ni mezclarlo directamente con la base local.

## Decision

Los archivos quedan preservados como referencia en:

```txt
docs/referencias-funciones/2026-05-16-FUNCIONES_C2C_SOPORTE/originales/
```

No deben ejecutarse directamente.

## Restriccion reforzada por usuario

No ejecutar nada contra `public` que contenga acciones de eliminacion, actualizacion, insercion, bloqueo, permisos, DDL, mantenimiento destructivo o funciones con efectos laterales.

Toda la informacion operacional de 2026 debe consultarse desde las tablas y vistas ya migradas al entorno local:

```txt
staging_public
rr_gestion_soporte
```

Los archivos historicos de esta carpeta solo sirven para rescatar formulas, criterios de negocio y nombres de metricas. Si una logica se incorpora al producto, debe reescribirse como SQL nuevo sobre los schemas locales.

Validacion de preservacion:

```txt
archivos origen utiles: 27
archivos preservados:   27
```

## Causa

Las funciones historicas mezclan varios riesgos:

- Referencias a `public`.
- Referencias a tablas sin schema: `documentos`, `caf`, `empresa`, `device`.
- Referencias a `rr_gestion_folios`, schema que no esta adoptado como capa actual.
- Sentencias de escritura: `INSERT`, `DELETE`, `UPDATE`.
- Sentencias administrativas: `ALTER`, `GRANT`.
- `DROP` comentados en encabezados.
- Materialized views y funciones pensadas para otro ciclo operativo.

El proyecto actual debe seguir usando:

```txt
staging_public
rr_gestion_soporte
```

## Inventario por dominio

### Folios y CAF

Archivos relevantes:

```txt
calcular_folios_disponibles_con_saltos.functions
calcular_folios_disponibles_historico.functions
calcular_folios_disponibles_por_rango.functions
calcular_historial_folios.functions
get_caf_status_summary.functions
get_status_folios_global.functions
guardar_folios_libres_historico.functions
insertar_rangos_libres.functions
obtener_rangos_caf.functions
obtener_resumen_folios.functions
obtener_resumen_folios_all.functions
obtener_resumen_folios_full.txt
registrar_folios_libres_con_saltos.txt
registrar_folios_libres_detallado.txt
resumen_caf.functions
resumen_caf.txt
subf_resumen_rangos.txt
```

Aporte:

- Logica de rangos CAF.
- Calculo de folios autorizados, usados y libres.
- Deteccion de saltos o folios no utilizados.
- Resumen por tenant, rut y tipo documento.
- Base para futuro `folios_control_resumen`.

Uso recomendado:

- Extraer formulas, no ejecutar funciones.
- Reescribir como vistas de lectura primero.
- Usar `staging_public.caf`, `staging_public.foliosdisponibles`, `staging_public.historialasignacionfolios` y `rr_gestion_soporte.documentos_2026_normalizados`.

### Empresas y dashboard global

Archivos relevantes:

```txt
dashboard_kpis.functions
generar_resumen_empresas.functions
resumen_empresas.txt
subf_resumen_empresa.txt
mv_salud_global_soporte.functions
```

Aporte:

- KPIs globales: empresas, devices, documentos, devices que emiten.
- Resumen empresa con documentos, CAF y folios.
- Salud global por tenant.
- Ultima emision y documentos recientes.

Uso recomendado:

- Comparar contra `empresa_control_resumen`, `documentos_2026_mensual` y `device_control_resumen`.
- Incorporar solo metricas que no dupliquen lo ya certificado.
- No crear materialized views hasta medir necesidad real.

### Devices y actividad

Archivos relevantes:

```txt
dispositivos_inactivos.functions
subf_resumen_devices.txt
subf_resumen_devices_docs.txt
```

Aporte:

- Conteo de devices por tenant.
- Documentos por device.
- Identificacion de devices inactivos.

Uso recomendado:

- Contrastar con `rr_gestion_soporte.device_control_resumen`.
- Reutilizar reglas de negocio, no tablas historicas de resumen.

### Helpers

Archivos relevantes:

```txt
cast_to_date_immutable.functions
update_timestamp.functions
```

Aporte:

- Parseo de fecha reutilizable.
- Trigger helper de `updated_at`.

Uso recomendado:

- Evaluar `cast_to_date_immutable` como funcion oficial futura si el parser inline de vistas queda corto.
- No adoptar `update_timestamp` hasta que existan tablas propias con ciclo de escritura.

## Priorizacion sugerida

### Prioridad 1

Reescribir control de folios/CAF como vistas de lectura:

```txt
rr_gestion_soporte.folios_caf_resumen
rr_gestion_soporte.folios_disponibles_resumen
rr_gestion_soporte.folios_alertas_resumen
```

Motivo:

- Folios es el siguiente dominio natural despues de empresa, documentos y devices.
- Ya existen consultas historicas con logica util.
- El usuario necesita alertas de bajo stock y diferencias de folios.

### Prioridad 2

Consolidar KPIs globales:

```txt
rr_gestion_soporte.soporte_kpis_globales
```

Motivo:

- Puede alimentar cards principales del nuevo layout soporte v1.
- Evita calcular todo desde frontend.

### Prioridad 3

Evaluar helpers:

```txt
rr_gestion_soporte.safe_parse_date
```

Motivo:

- Las fechas historicas aparecen en varios formatos.
- Una funcion controlada puede simplificar vistas futuras.

## Mapeo requerido

| Historico | Proyecto actual |
| --- | --- |
| `public.documentos` o `documentos` | `rr_gestion_soporte.documentos_2026_normalizados` |
| `public.caf` o `caf` | `staging_public.caf` |
| `public.empresa` o `empresa` | `staging_public.empresa` |
| `public.device` or `device` | `staging_public.device` |
| `rr_gestion_folios.*` | pendiente definir; preferir `rr_gestion_soporte.*` |
| `public.dashboard_kpis` | futura vista `rr_gestion_soporte.soporte_kpis_globales` |
| `public.mv_salud_global_soporte` | evaluar despues de vistas de lectura |

## No ejecutar

No ejecutar ningun archivo original por estas razones:

- Puede modificar datos.
- Puede crear objetos en schemas no deseados.
- Puede otorgar permisos.
- Puede depender de objetos no existentes.
- Puede duplicar logica ya certificada.

## Camino recomendado

1. Mantener originales como referencia.
2. Crear un documento de diseno de folios/CAF.
3. Crear scripts nuevos en `database/sql/` con vistas de lectura.
4. Verificar totales contra consultas simples.
5. Exponer endpoints solo cuando los numeros cuadren.
6. Integrar cards de folios en layout soporte v1.

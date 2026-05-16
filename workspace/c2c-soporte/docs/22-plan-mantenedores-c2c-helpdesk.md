# Plan de mantenedores C2C Helpdesk

Fecha: 2026-05-16

## Objetivo

Definir los mantenedores iniciales del sistema, separando datos de solo lectura desde origen y datos locales editables del producto.

## Regla principal

Los mantenedores no deben modificar `public` ni `staging_public`.

Los mantenedores editables deben escribir solo en tablas controladas del schema:

```txt
rr_gestion_soporte
```

## Tipos de mantenedor

### Solo lectura

Muestran datos importados o derivados. No permiten editar.

Ejemplos:

- Empresas.
- Tenants.
- Devices.
- CAF.
- Documentos.
- Rangos.

### Editable local

Permiten configurar reglas propias de soporte.

Ejemplos:

- Umbrales de alerta.
- Catalogo tipo DTE.
- Parametros de procesos.
- Contactos internos o clasificaciones de soporte.

### Futuro controlado

Podrian ejecutar acciones manuales, pero solo despues de permisos, auditoria y confirmacion.

Ejemplos:

- Ejecutar carga anual agregada.
- Exportar rangos candidatos.
- Recalcular vistas materializadas locales si se agregan.

## Mantenedores propuestos

### 1. Empresas / Tenants

Tipo:

```txt
Solo lectura
```

Fuente:

```txt
rr_gestion_soporte.empresa_control_resumen
staging_public.tenant
staging_public.empresa
```

Uso:

- Maestro principal para seleccionar empresa.
- Relacionar tenant, RUT y nombre.
- Revisar estado activo/inactivo.

Campos UI:

- Tenant.
- RUT.
- Nombre empresa.
- Estado empresa.
- Estado tenant.
- Ultima emision.
- Dias sin emitir.
- Estado operacional.

Acciones iniciales:

- Ver detalle.
- Filtrar.
- Exportar vista filtrada.

Sin edicion inicial.

### 2. Cajeros / Devices

Tipo:

```txt
Solo lectura
```

Fuente:

```txt
rr_gestion_soporte.device_control_resumen
rr_gestion_soporte.cajero_control_resumen
rr_gestion_soporte.folios_resumen_device_extendido
```

Uso:

- Revisar devices por empresa.
- Detectar cajeros sin emision.
- Ver primer y ultimo folio.
- Revisar diferencias de historial.

Campos UI:

- Tenant.
- RUT.
- Device ID.
- Nombre device.
- Estado tecnico.
- Estado operacional.
- Documentos 2026.
- Ultima emision.
- Dias sin emision.
- Primer folio.
- Ultimo folio.

Acciones iniciales:

- Ver detalle.
- Filtrar por estado.
- Exportar.

Sin edicion inicial.

### 3. Tipos DTE

Tipo:

```txt
Solo lectura inicial; editable local futuro
```

Tabla actual:

```txt
rr_gestion_soporte.caf_vencimiento_config
```

Campos actuales:

- `document_type`
- `document_label`
- `vigencia_meses`
- `warning_dias`
- `aplica_vencimiento`
- `activo`
- `created_at`
- `updated_at`

Uso:

- Mostrar nombres legibles.
- Poblar filtros.
- Evitar codigos sueltos en frontend.
- Mostrar reglas de vencimiento CAF por tipo DTE.

Acciones:

- Ver configuracion.
- Filtrar por estado.
- Preparar edicion posterior con auditoria.

No debe cambiar documentos ni CAF.

### 4. Umbrales de alerta

Tipo:

```txt
Editable local
```

Tabla actual:

```txt
rr_gestion_soporte.folios_alerta_config
```

Campos actuales:

- Tenant opcional.
- RUT opcional.
- Tipo documento opcional.
- Minimo folios warning.
- Minimo folios urgente.
- Dias agotamiento warning.
- Dias agotamiento urgente.
- Dias sin emision warning.
- Dias sin emision urgente.
- Activo.

Uso:

- Ajustar alertas globales.
- Permitir excepciones por empresa o tipo documento.

Acciones:

- Crear regla.
- Editar regla.
- Activar/desactivar regla.

Requisitos:

- Auditoria local.
- Confirmacion antes de guardar.
- Validacion de numeros positivos.

### 5. Rangos CAF / SII

Tipo:

```txt
Solo lectura con exportacion
```

Fuente:

```txt
rr_gestion_soporte.folios_rangos_clasificados_detalle
```

Uso:

- Identificar rangos anteriores con folios no utilizados.
- Separar futuros, actuales, agotados y candidatos.
- Preparar exportacion para revision externa.

Acciones:

- Filtrar.
- Exportar rangos filtrados.
- Ver detalle.

Sin edicion inicial.

### 6. Procesos historicos

Tipo:

```txt
Solo lectura inicialmente
```

Tabla actual:

```txt
rr_gestion_soporte.proceso_historial_anual_log
```

Uso:

- Ver ejecuciones de carga historica anual.
- Revisar estado y resultados.

Acciones futuras:

- Ejecutar proceso anual manual.
- Reintentar proceso fallido.

Estas acciones deben esperar hasta tener roles, auditoria y confirmacion.

### 7. Contactos soporte

Tipo:

```txt
Editable local futuro
```

Tabla sugerida:

```txt
rr_gestion_soporte.contacto_soporte
```

Uso:

- Asociar contactos operativos a empresas.
- Preparar modulo de tickets o seguimiento.

Campos sugeridos:

- Tenant.
- RUT.
- Nombre.
- Email.
- Telefono.
- Rol.
- Origen.
- Activo.

Nota:

Este mantenedor puede esperar hasta que el flujo de tickets este definido.

## Orden recomendado

1. Empresas / Tenants solo lectura.
2. Cajeros / Devices solo lectura.
3. Tipos DTE editable local.
4. Umbrales de alerta editable local.
5. Rangos CAF / SII solo lectura con exportacion.
6. Procesos historicos solo lectura.
7. Contactos soporte futuro.

## Reglas UI para mantenedores

- Todos deben tener busqueda.
- Todos deben tener paginacion.
- Todos deben tener estado loading.
- Todos deben tener estado error.
- Todos deben tener estado vacio.
- Los editables deben tener validacion antes de guardar.
- Los editables deben mostrar confirmacion.
- Los editables deben registrar auditoria local.

## Reglas backend

- Endpoints separados por dominio.
- Validacion con Zod.
- SQL parametrizado.
- Responses estandar.
- Logs con `requestId`.
- No exponer errores internos completos al frontend.

## Primer mantenedor editable recomendado

El primer mantenedor editable debe ser:

```txt
Umbrales de alerta
```

Motivo:

- Es local.
- No toca datos importados.
- Tiene alto valor operativo.
- Permite ajustar warnings sin cambiar SQL.

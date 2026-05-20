# Bitacora: modulo empresas enterprise

**Fecha**: 2026-05-20

## Contexto

Se solicita construir el modulo de empresas usando los criterios:

- `uiux-enterprise-dashboard`
- `react-crud-enterprise`
- `multi-tenant-platform`

## Cambio

- Se separa la vista de empresas en `frontend/src/modules/companies/components/CompaniesModule.tsx`.
- Se agrega cabecera operacional, KPIs, filtros, tabla empresarial y panel lateral.
- Se prepara el espacio de acciones CRUD sin activar escrituras todavia.
- La seleccion de empresa sigue operando por `tenant_id` + `rut`.

## Criterio aplicado

- Dashboard empresarial: KPIs superiores y lectura compacta.
- CRUD empresarial: modulo separado, props claras, estados loading/error/empty/retry.
- Multi-tenant: tenant visible en tabla, seleccion y panel lateral para evitar ambiguedad.

## Pendiente

Definir cuando se habilitaran acciones reales de crear/editar/auditar empresas y que
tablas locales del esquema `rr_gestion_soporte` seran la fuente de escritura.

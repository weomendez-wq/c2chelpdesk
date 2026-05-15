import { dbPool } from "../../config/database.js";
import type { CompaniesQuery, CompanyDevicesQuery, DevicesQuery } from "./support.schemas.js";

export type PaginatedResult<TItem> = {
  items: TItem[];
  pagination: {
    limit: number;
    offset: number;
  };
};

const addFilter = (clauses: string[], values: unknown[], sql: string, value: unknown) => {
  if (value === undefined) {
    return;
  }

  values.push(value);
  clauses.push(sql.replace("?", `$${values.length}`));
};

const appendPagination = (values: unknown[], limit: number, offset: number) => {
  values.push(limit);
  const limitPlaceholder = `$${values.length}`;
  values.push(offset);
  const offsetPlaceholder = `$${values.length}`;

  return `LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`;
};

export const listCompanies = async (
  query: CompaniesQuery
): Promise<PaginatedResult<Record<string, unknown>>> => {
  const clauses: string[] = [];
  const values: unknown[] = [];

  addFilter(clauses, values, "tenant_id = ?", query.tenantId);
  addFilter(clauses, values, "empresa_status = ?", query.status);

  if (query.search) {
    values.push(`%${query.search}%`, `%${query.search}%`, `%${query.search}%`);
    clauses.push(
      `(empresa_name ILIKE $${values.length - 2} OR rut::text ILIKE $${values.length - 1} OR tenant_name ILIKE $${values.length})`
    );
  }

  const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const paginationSql = appendPagination(values, query.limit, query.offset);

  const result = await dbPool.query(
    `SELECT *
     FROM rr_gestion_soporte.empresas_resumen
     ${whereSql}
     ORDER BY empresa_name ASC
     ${paginationSql}`,
    values
  );

  return {
    items: result.rows,
    pagination: {
      limit: query.limit,
      offset: query.offset
    }
  };
};

export const listDevices = async (
  query: DevicesQuery
): Promise<PaginatedResult<Record<string, unknown>>> => {
  const clauses: string[] = [];
  const values: unknown[] = [];

  addFilter(clauses, values, "tenant_id = ?", query.tenantId);
  addFilter(clauses, values, "device_status = ?", query.status);

  if (query.search) {
    values.push(`%${query.search}%`, `%${query.search}%`, `%${query.search}%`);
    clauses.push(
      `(device_name ILIKE $${values.length - 2} OR device_id ILIKE $${values.length - 1} OR local ILIKE $${values.length})`
    );
  }

  const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const paginationSql = appendPagination(values, query.limit, query.offset);

  const result = await dbPool.query(
    `SELECT *
     FROM rr_gestion_soporte.dispositivos_resumen
     ${whereSql}
     ORDER BY device_name ASC NULLS LAST, device_id ASC
     ${paginationSql}`,
    values
  );

  return {
    items: result.rows,
    pagination: {
      limit: query.limit,
      offset: query.offset
    }
  };
};

export const listCompanyDevices = async (
  query: CompanyDevicesQuery
): Promise<PaginatedResult<Record<string, unknown>>> => {
  const clauses: string[] = [];
  const values: unknown[] = [];

  addFilter(clauses, values, "tenant_id = ?", query.tenantId);
  addFilter(clauses, values, "rut = ?", query.rut);
  addFilter(clauses, values, "device_status = ?", query.status);

  if (query.search) {
    values.push(`%${query.search}%`, `%${query.search}%`, `%${query.search}%`, `%${query.search}%`);
    clauses.push(
      `(empresa_name ILIKE $${values.length - 3} OR rut::text ILIKE $${values.length - 2} OR device_name ILIKE $${values.length - 1} OR device_id ILIKE $${values.length})`
    );
  }

  const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const paginationSql = appendPagination(values, query.limit, query.offset);

  const result = await dbPool.query(
    `SELECT *
     FROM rr_gestion_soporte.empresa_dispositivo_resumen
     ${whereSql}
     ORDER BY empresa_name ASC, device_name ASC NULLS LAST
     ${paginationSql}`,
    values
  );

  return {
    items: result.rows,
    pagination: {
      limit: query.limit,
      offset: query.offset
    }
  };
};

import { z } from "zod";

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  search: z.string().trim().min(1).max(120).optional()
});

export const companiesQuerySchema = paginationQuerySchema.extend({
  status: z.string().trim().min(1).max(60).optional(),
  tenantId: z.string().uuid().optional()
});

export const devicesQuerySchema = paginationQuerySchema.extend({
  status: z.string().trim().min(1).max(60).optional(),
  tenantId: z.string().uuid().optional()
});

export const companyDevicesQuerySchema = paginationQuerySchema.extend({
  status: z.string().trim().min(1).max(60).optional(),
  tenantId: z.string().uuid().optional(),
  rut: z.coerce.number().int().positive().optional()
});

export type CompaniesQuery = z.infer<typeof companiesQuerySchema>;
export type DevicesQuery = z.infer<typeof devicesQuerySchema>;
export type CompanyDevicesQuery = z.infer<typeof companyDevicesQuerySchema>;

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

export const companyControlQuerySchema = paginationQuerySchema.extend({
  status: z.string().trim().min(1).max(60).optional(),
  tenantId: z.string().uuid().optional(),
  rut: z.coerce.number().int().positive().optional(),
  alert: z.enum(["OK", "WARNING", "URGENTE", "SIN_EMISION"]).optional()
});

export const deviceControlQuerySchema = paginationQuerySchema.extend({
  status: z.string().trim().min(1).max(60).optional(),
  tenantId: z.string().uuid().optional(),
  rut: z.coerce.number().int().positive().optional(),
  alert: z.enum(["OK", "WARNING", "URGENTE", "SIN_EMISION"]).optional(),
  consistency: z
    .enum(["OK", "ACTIVO_SIN_EMISION", "ACTIVO_SIN_EMISION_RECIENTE", "NO_ACTIVO_CON_EMISION"])
    .optional()
});

export const foliosControlQuerySchema = paginationQuerySchema.extend({
  alert: z.enum(["OK", "WARNING", "URGENTE", "SIN_FOLIOS", "REVISION_DATOS"]).optional(),
  documentType: z.coerce.number().int().positive().optional(),
  rut: z.coerce.number().int().positive().optional(),
  tenantId: z.string().uuid().optional()
});

export const folioRangesQuerySchema = paginationQuerySchema.extend({
  clasificacionTemporal: z
    .enum(["RANGOFUTURO", "RANGOACTUAL", "RANGOANTERIOR", "SINCLASIFICACION"])
    .optional(),
  documentType: z.coerce.number().int().positive().optional(),
  estadoOperativo: z
    .enum(["POR_OCUPAR", "EN_USO", "AGOTADO", "CADUCADO_CANDIDATO", "REVISION_DATOS"])
    .optional(),
  estadoRango: z.enum(["RANGOSINUSO", "RANGOOCUPADO", "RANGOCARGAPARCIAL"]).optional(),
  rut: z.coerce.number().int().positive().optional(),
  tenantId: z.string().uuid().optional()
});

export const documentsSummaryQuerySchema = z.object({
  tenantId: z.string().uuid().optional(),
  rut: z.coerce.number().int().positive().optional()
});

export type CompaniesQuery = z.infer<typeof companiesQuerySchema>;
export type DevicesQuery = z.infer<typeof devicesQuerySchema>;
export type CompanyDevicesQuery = z.infer<typeof companyDevicesQuerySchema>;
export type CompanyControlQuery = z.infer<typeof companyControlQuerySchema>;
export type DeviceControlQuery = z.infer<typeof deviceControlQuerySchema>;
export type FoliosControlQuery = z.infer<typeof foliosControlQuerySchema>;
export type FolioRangesQuery = z.infer<typeof folioRangesQuerySchema>;
export type DocumentsSummaryQuery = z.infer<typeof documentsSummaryQuerySchema>;

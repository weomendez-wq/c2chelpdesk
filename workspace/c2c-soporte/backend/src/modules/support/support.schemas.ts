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

export const alertsQuerySchema = paginationQuerySchema.extend({
  rut: z.coerce.number().int().positive().optional(),
  severity: z
    .enum([
      "REVISION_DATOS",
      "SIN_FOLIOS",
      "URGENTE",
      "WARNING",
      "SIN_EMISION",
      "SIN_BASE_ESTIMACION"
    ])
    .optional(),
  source: z.enum(["EMPRESA", "DEVICE", "FOLIOS", "AGOTAMIENTO", "CAF_VENCIMIENTO"]).optional(),
  tenantId: z.string().uuid().optional()
});

export const documentsSummaryQuerySchema = z.object({
  tenantId: z.string().uuid().optional(),
  rut: z.coerce.number().int().positive().optional()
});

export const cacheRefreshRequestSchema = z.object({
  confirm: z.literal("REFRESH_LOCAL_CACHES"),
  requestedBy: z.string().trim().min(1).max(120).default("local-support")
});

export const dteConfigUpdateRequestSchema = z.object({
  activo: z.boolean(),
  aplicaVencimiento: z.boolean(),
  confirm: z.literal("UPDATE_DTE_CONFIG"),
  documentLabel: z.string().trim().min(3).max(120),
  requestedBy: z.string().trim().min(1).max(120).default("local-support"),
  vigenciaMeses: z.union([z.coerce.number().int().min(1).max(120), z.null()]),
  warningDias: z.coerce.number().int().min(0).max(365)
});

export const foliosAlertConfigUpdateRequestSchema = z.object({
  activo: z.boolean(),
  confirm: z.literal("UPDATE_FOLIOS_ALERT_CONFIG"),
  diasAgotamientoUrgente: z.coerce.number().int().min(0).max(3650),
  diasAgotamientoWarning: z.coerce.number().int().min(0).max(3650),
  diasSinEmisionUrgente: z.coerce.number().int().min(0).max(3650),
  diasSinEmisionWarning: z.coerce.number().int().min(0).max(3650),
  minimoFoliosUrgente: z.coerce.number().int().min(0).max(999999999),
  minimoFoliosWarning: z.coerce.number().int().min(0).max(999999999),
  requestedBy: z.string().trim().min(1).max(120).default("local-support")
});

export const helpdeskTicketQuerySchema = paginationQuerySchema.extend({
  status: z.string().trim().min(1).max(80).optional(),
  priority: z.string().trim().min(1).max(80).optional(),
  rut: z.string().trim().min(1).max(20).optional(),
  tenantId: z.string().uuid().optional()
});

export const helpdeskManualTicketRequestSchema = z.object({
  title: z.string().trim().min(5).max(180),
  description: z.string().trim().max(4000).optional(),
  channelCode: z.string().trim().min(2).max(80).default("EMAIL"),
  communicationTypeCode: z.string().trim().min(2).max(80).default("EXTERNAL"),
  priorityCode: z.string().trim().min(2).max(80).default("MEDIUM"),
  categoryCode: z.string().trim().min(2).max(80).optional(),
  supportTypeCode: z.string().trim().min(2).max(80).optional(),
  contactName: z.string().trim().min(2).max(200).optional(),
  contactEmail: z.string().trim().email().max(255).optional(),
  contactPhone: z.string().trim().min(5).max(30).optional(),
  tenantId: z.string().uuid().optional(),
  rut: z.string().trim().min(1).max(20).optional(),
  companyName: z.string().trim().min(2).max(220).optional(),
  requestedBy: z.string().trim().min(1).max(120).default("external-channel"),
  dueAt: z.string().datetime().optional()
});

export const helpdeskEmailIntakeRequestSchema = z.object({
  bodyText: z.string().trim().min(1).max(12000),
  companyName: z.string().trim().min(2).max(220).optional(),
  confirm: z.literal("SIMULATE_EMAIL_INTAKE"),
  conversationId: z.string().trim().min(1).max(512).optional(),
  fromEmail: z.string().trim().email().max(255),
  fromName: z.string().trim().min(2).max(255).optional(),
  mailbox: z.string().trim().email().max(255).optional(),
  messageId: z.string().trim().min(3).max(512).optional(),
  priorityCode: z.string().trim().min(2).max(80).default("MEDIUM"),
  receivedAt: z.string().datetime().optional(),
  replyTo: z.string().trim().email().max(255).optional(),
  requestedBy: z.string().trim().min(1).max(120).default("email-intake-simulated"),
  rut: z.string().trim().min(1).max(20).optional(),
  subject: z.string().trim().min(3).max(300),
  tenantId: z.string().uuid().optional()
});

export type AlertsQuery = z.infer<typeof alertsQuerySchema>;
export type CacheRefreshRequest = z.infer<typeof cacheRefreshRequestSchema>;
export type CompaniesQuery = z.infer<typeof companiesQuerySchema>;
export type DevicesQuery = z.infer<typeof devicesQuerySchema>;
export type CompanyDevicesQuery = z.infer<typeof companyDevicesQuerySchema>;
export type CompanyControlQuery = z.infer<typeof companyControlQuerySchema>;
export type DeviceControlQuery = z.infer<typeof deviceControlQuerySchema>;
export type FoliosControlQuery = z.infer<typeof foliosControlQuerySchema>;
export type FolioRangesQuery = z.infer<typeof folioRangesQuerySchema>;
export type DocumentsSummaryQuery = z.infer<typeof documentsSummaryQuerySchema>;
export type DteConfigUpdateRequest = z.infer<typeof dteConfigUpdateRequestSchema>;
export type FoliosAlertConfigUpdateRequest = z.infer<
  typeof foliosAlertConfigUpdateRequestSchema
>;
export type HelpdeskTicketQuery = z.infer<typeof helpdeskTicketQuerySchema>;
export type HelpdeskManualTicketRequest = z.infer<typeof helpdeskManualTicketRequestSchema>;
export type HelpdeskEmailIntakeRequest = z.infer<typeof helpdeskEmailIntakeRequestSchema>;

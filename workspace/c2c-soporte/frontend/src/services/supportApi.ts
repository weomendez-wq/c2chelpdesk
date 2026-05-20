export type ApiSuccess<TData> = {
  ok: true;
  data: TData;
  meta: {
    requestId: string;
  };
};

export type PaginatedResponse<TItem> = {
  items: TItem[];
  pagination: {
    limit: number;
    offset: number;
    total?: number;
  };
};

export type CompanyControlAlert = "OK" | "WARNING" | "URGENTE" | "SIN_EMISION";
export type FoliosControlAlert = "OK" | "WARNING" | "URGENTE" | "SIN_FOLIOS" | "REVISION_DATOS";
export type AlertSeverity =
  | "REVISION_DATOS"
  | "SIN_FOLIOS"
  | "URGENTE"
  | "WARNING"
  | "SIN_EMISION"
  | "SIN_BASE_ESTIMACION";
export type AlertSource = "EMPRESA" | "DEVICE" | "FOLIOS" | "AGOTAMIENTO" | "CAF_VENCIMIENTO";
export type FolioRangeOperationalState =
  | "POR_OCUPAR"
  | "EN_USO"
  | "AGOTADO"
  | "CADUCADO_CANDIDATO"
  | "REVISION_DATOS";
export type FolioRangeState = "RANGOSINUSO" | "RANGOOCUPADO" | "RANGOCARGAPARCIAL";
export type FolioRangeTemporalState =
  | "RANGOFUTURO"
  | "RANGOACTUAL"
  | "RANGOANTERIOR"
  | "SINCLASIFICACION";
export type DeviceConsistencyAlert =
  | "OK"
  | "ACTIVO_SIN_EMISION"
  | "ACTIVO_SIN_EMISION_RECIENTE"
  | "NO_ACTIVO_CON_EMISION";

export type CompanyControl = {
  tenant_id: string;
  tenant_name: string | null;
  tenant_status: string | null;
  rut: number | null;
  empresa_name: string | null;
  empresa_status: string | null;
  giro: string | null;
  comuna: string | null;
  ciudad: string | null;
  documentos_emitidos_2026: number;
  primera_emision: string | null;
  ultima_emision: string | null;
  dias_desde_primera_emision: number | null;
  dias_sin_emitir: number | null;
  nivel_alerta_emision: CompanyControlAlert;
};

export type CompanyControlQuery = {
  limit?: number;
  offset?: number;
  search?: string;
  status?: string;
  alert?: CompanyControlAlert;
};

export type DocumentsSummaryQuery = {
  tenantId?: string;
  rut?: number;
};

export type DeviceControl = {
  tenant_id: string;
  tenant_name: string | null;
  tenant_status: string | null;
  rut: number | null;
  empresa_name: string | null;
  empresa_status: string | null;
  device_id: string;
  device_name: string | null;
  device_status: string | null;
  local: string | null;
  comuna: string | null;
  ciudad: string | null;
  config_group_name: string | null;
  config_group_status: string | null;
  created_at: string | null;
  dias_desde_creacion: number | null;
  estado_garantia: string;
  documentos_emitidos_2026: number;
  periodos_con_emision: number;
  primera_emision: string | null;
  ultima_emision: string | null;
  dias_sin_emitir: number | null;
  promedio_documentos_periodo: number;
  total_valor_documentos: number;
  nivel_alerta_emision: CompanyControlAlert;
  alerta_consistencia: DeviceConsistencyAlert;
};

export type DeviceControlQuery = {
  limit?: number;
  offset?: number;
  search?: string;
  status?: string;
  tenantId?: string;
  rut?: number;
  alert?: CompanyControlAlert;
  consistency?: DeviceConsistencyAlert;
};

export type FoliosControl = {
  tenant_id: string;
  tenant_name: string | null;
  tenant_status: string | null;
  rut: number | null;
  empresa_name: string | null;
  empresa_status: string | null;
  document_type: number;
  caf_count: number;
  folios_otorgados: number;
  primer_caf: string | null;
  ultimo_caf: string | null;
  folio_min: number | null;
  folio_max: number | null;
  rangos_disponibles: number;
  folios_disponibles: number;
  folios_entregados_por_rango: number;
  folios_solicitados: number;
  diferencia_solicitado_rango: number;
  devices_con_revision_historial: number;
  documentos_emitidos_2026: number;
  devices_con_emision: number;
  primera_emision: string | null;
  ultima_emision: string | null;
  dias_sin_emitir: number | null;
  nivel_alerta_folios: FoliosControlAlert;
};

export type FoliosControlQuery = {
  limit?: number;
  offset?: number;
  search?: string;
  tenantId?: string;
  rut?: number;
  documentType?: number;
  alert?: FoliosControlAlert;
};

export type FolioRange = {
  tenant_id: string;
  tenant_name: string | null;
  rut: number | null;
  empresa_name: string | null;
  document_type: number;
  cafserial: number | null;
  folio_ini: number;
  folio_fin: number;
  total_rango: number;
  caf_created_at: string | null;
  total_ocupado: number;
  total_documentos_desocupados: number;
  primer_folio_emitido: number | null;
  folio_mayor: number | null;
  folio_mayor_global: number | null;
  fecha_ultima_emision: string | null;
  estado_rango: FolioRangeState;
  clasificacion_temporal: FolioRangeTemporalState;
  caf_resultado: string;
  lost_folios: number;
  estado_operativo_rango: FolioRangeOperationalState;
  document_label: string | null;
  vigencia_meses: number | null;
  warning_dias: number | null;
  aplica_vencimiento: boolean | null;
  caf_fecha_autorizacion: string | null;
  caf_fecha_vencimiento: string | null;
  caf_dias_para_vencer: number | null;
  nivel_alerta_caf_vencimiento: string | null;
};

export type FolioRangeQuery = {
  clasificacionTemporal?: FolioRangeTemporalState;
  documentType?: number;
  estadoOperativo?: FolioRangeOperationalState;
  estadoRango?: FolioRangeState;
  limit?: number;
  offset?: number;
  rut?: number;
  search?: string;
  tenantId?: string;
};

export type OperationalAlert = {
  tenant_id: string;
  tenant_name: string | null;
  rut: number | null;
  empresa_name: string | null;
  source: AlertSource;
  severity: AlertSeverity;
  title: string;
  detail: string;
  entity_id: string | null;
  document_type: number | null;
  metric_value: number | null;
  metric_secondary: number | null;
  reference_date: string | null;
};

export type CacheStatus = {
  currentCounts: Record<string, number>;
  lastRefresh: {
    cacheCounts: Record<string, number> | null;
    durationMs: number | null;
    finishedAt: string | null;
    message: string | null;
    refreshId: number;
    requestedBy: string | null;
    startedAt: string;
    status: string;
  } | null;
};

export type DteConfig = {
  activo: boolean;
  aplica_vencimiento: boolean;
  config_id: number;
  created_at: string;
  document_label: string;
  document_type: number;
  updated_at: string;
  vigencia_meses: number | null;
  warning_dias: number;
};

export type DteConfigUpdateRequest = {
  activo: boolean;
  aplicaVencimiento: boolean;
  documentLabel: string;
  vigenciaMeses: number | null;
  warningDias: number;
};

export type FoliosAlertConfig = {
  activo: boolean;
  config_id: number;
  created_at: string;
  dias_agotamiento_urgente: number;
  dias_agotamiento_warning: number;
  dias_sin_emision_urgente: number;
  dias_sin_emision_warning: number;
  document_type: number | null;
  minimo_folios_urgente: number;
  minimo_folios_warning: number;
  rut: number | null;
  tenant_id: string | null;
  updated_at: string;
};

export type FoliosAlertConfigUpdateRequest = {
  activo: boolean;
  diasAgotamientoUrgente: number;
  diasAgotamientoWarning: number;
  diasSinEmisionUrgente: number;
  diasSinEmisionWarning: number;
  minimoFoliosUrgente: number;
  minimoFoliosWarning: number;
};

export type HelpdeskTicket = {
  ticketId: number;
  ticketNumber: number;
  title: string;
  description: string | null;
  statusCode: string;
  priorityCode: string;
  categoryCode: string | null;
  channelCode: string | null;
  communicationTypeCode: string | null;
  source: string;
  tenantId: string | null;
  rut: string | null;
  companyName: string | null;
  contactName: string | null;
  contactEmail: string | null;
  openedAt: string;
  dueAt: string | null;
};

export type HelpdeskTicketQuery = {
  limit?: number;
  offset?: number;
  search?: string;
  status?: string;
  priority?: string;
  tenantId?: string;
  rut?: string;
};

export type HelpdeskManualTicketRequest = {
  title: string;
  description?: string;
  channelCode: string;
  communicationTypeCode: string;
  priorityCode: string;
  categoryCode?: string;
  supportTypeCode?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  tenantId?: string;
  rut?: string;
  companyName?: string;
  requestedBy: string;
  dueAt?: string;
};

export type GmailSyncResult = {
  enabled: boolean;
  mailbox: string | null;
  processed: number;
  created: number;
  duplicates: number;
  skipped: number;
  items: Array<{
    duplicate?: boolean;
    emailMessageId?: number;
    gmailId: string;
    messageId: string;
    subject: string;
    ticketNumber?: number;
  }>;
};

export type GmailSyncRequest = {
  maxResults?: number;
  query?: string;
  requestedBy?: string;
};

export type AlertsQuery = {
  limit?: number;
  offset?: number;
  search?: string;
  tenantId?: string;
  rut?: number;
  severity?: AlertSeverity;
  source?: AlertSource;
};

export type DocumentsSummary = {
  filters: {
    tenantId?: string;
    rut?: number;
  };
  totals: {
    documents: number;
    companies: number;
    devices: number;
    documentTypes: number;
  };
  monthly: Array<{
    period: string;
    documents: number;
  }>;
  byDocumentType: Array<{
    documentType: number;
    documents: number;
  }>;
};

const buildQueryString = (query: Record<string, string | number | undefined>) => {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

const readApiError = async (response: Response, fallback: string) => {
  try {
    const payload = (await response.json()) as {
      error?: {
        code?: string;
        message?: string;
      };
    };

    if (payload.error?.message) {
      return payload.error.code
        ? `${payload.error.code}: ${payload.error.message}`
        : payload.error.message;
    }
  } catch {
    return fallback;
  }

  return fallback;
};

export const getCompanyControl = async (
  query: CompanyControlQuery,
  signal?: AbortSignal
): Promise<PaginatedResponse<CompanyControl>> => {
  const response = await fetch(`/api/support/control/companies${buildQueryString(query)}`, {
    signal
  });

  if (!response.ok) {
    throw new Error("No se pudo consultar el control de empresas");
  }

  const payload = (await response.json()) as ApiSuccess<PaginatedResponse<CompanyControl>>;

  if (!payload.ok) {
    throw new Error("Respuesta API invalida");
  }

  return payload.data;
};

export const getDocumentsSummary = async (
  query: DocumentsSummaryQuery,
  signal?: AbortSignal
): Promise<DocumentsSummary> => {
  const response = await fetch(`/api/support/control/documents-summary${buildQueryString(query)}`, {
    signal
  });

  if (!response.ok) {
    throw new Error("No se pudo consultar el resumen documental");
  }

  const payload = (await response.json()) as ApiSuccess<DocumentsSummary>;

  if (!payload.ok) {
    throw new Error("Respuesta API invalida");
  }

  return payload.data;
};

export const getDeviceControl = async (
  query: DeviceControlQuery,
  signal?: AbortSignal
): Promise<PaginatedResponse<DeviceControl>> => {
  const response = await fetch(`/api/support/control/devices${buildQueryString(query)}`, {
    signal
  });

  if (!response.ok) {
    throw new Error("No se pudo consultar el control de devices");
  }

  const payload = (await response.json()) as ApiSuccess<PaginatedResponse<DeviceControl>>;

  if (!payload.ok) {
    throw new Error("Respuesta API invalida");
  }

  return payload.data;
};

export const getFoliosControl = async (
  query: FoliosControlQuery,
  signal?: AbortSignal
): Promise<PaginatedResponse<FoliosControl>> => {
  const response = await fetch(`/api/support/control/folios${buildQueryString(query)}`, {
    signal
  });

  if (!response.ok) {
    throw new Error("No se pudo consultar el control de folios");
  }

  const payload = (await response.json()) as ApiSuccess<PaginatedResponse<FoliosControl>>;

  if (!payload.ok) {
    throw new Error("Respuesta API invalida");
  }

  return payload.data;
};

export const getFolioRanges = async (
  query: FolioRangeQuery,
  signal?: AbortSignal
): Promise<PaginatedResponse<FolioRange>> => {
  const response = await fetch(`/api/support/control/folio-ranges${buildQueryString(query)}`, {
    signal
  });

  if (!response.ok) {
    throw new Error("No se pudo consultar rangos SII");
  }

  const payload = (await response.json()) as ApiSuccess<PaginatedResponse<FolioRange>>;

  if (!payload.ok) {
    throw new Error("Respuesta API invalida");
  }

  return payload.data;
};

export const getOperationalAlerts = async (
  query: AlertsQuery,
  signal?: AbortSignal
): Promise<PaginatedResponse<OperationalAlert>> => {
  const response = await fetch(`/api/support/control/alerts${buildQueryString(query)}`, {
    signal
  });

  if (!response.ok) {
    throw new Error("No se pudo consultar alertas operacionales");
  }

  const payload = (await response.json()) as ApiSuccess<PaginatedResponse<OperationalAlert>>;

  if (!payload.ok) {
    throw new Error("Respuesta API invalida");
  }

  return payload.data;
};

export const getHelpdeskTickets = async (
  query: HelpdeskTicketQuery,
  signal?: AbortSignal
): Promise<PaginatedResponse<HelpdeskTicket>> => {
  const response = await fetch(`/api/support/helpdesk/tickets${buildQueryString(query)}`, {
    signal
  });

  if (!response.ok) {
    throw new Error("No se pudo consultar tickets helpdesk");
  }

  const payload = (await response.json()) as ApiSuccess<PaginatedResponse<HelpdeskTicket>>;

  if (!payload.ok) {
    throw new Error("Respuesta API invalida");
  }

  return payload.data;
};

export const createManualHelpdeskTicket = async (
  request: HelpdeskManualTicketRequest
): Promise<HelpdeskTicket> => {
  const response = await fetch("/api/support/helpdesk/tickets/manual", {
    body: JSON.stringify(request),
    headers: {
      "content-type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("No se pudo crear el ticket manual");
  }

  const payload = (await response.json()) as ApiSuccess<HelpdeskTicket>;

  if (!payload.ok) {
    throw new Error("Respuesta API invalida");
  }

  return payload.data;
};

export const syncGmailHelpdesk = async (
  request: GmailSyncRequest = {}
): Promise<GmailSyncResult> => {
  const response = await fetch("/api/support/helpdesk/email-intake/gmail/sync", {
    body: JSON.stringify({
      confirm: "SYNC_GMAIL_HELPDESK",
      maxResults: request.maxResults ?? 10,
      query: request.query,
      requestedBy: request.requestedBy ?? "frontend-local"
    }),
    headers: {
      "content-type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "No se pudo sincronizar Gmail"));
  }

  const payload = (await response.json()) as ApiSuccess<GmailSyncResult>;

  if (!payload.ok) {
    throw new Error("Respuesta API invalida");
  }

  return payload.data;
};

export const getCacheStatus = async (signal?: AbortSignal): Promise<CacheStatus> => {
  const response = await fetch("/api/support/control/cache-status", {
    signal
  });

  if (!response.ok) {
    throw new Error("No se pudo consultar el estado de caches");
  }

  const payload = (await response.json()) as ApiSuccess<CacheStatus>;

  if (!payload.ok) {
    throw new Error("Respuesta API invalida");
  }

  return payload.data;
};

export const getDteConfig = async (signal?: AbortSignal): Promise<DteConfig[]> => {
  const response = await fetch("/api/support/control/maintainers/dte-config", {
    signal
  });

  if (!response.ok) {
    throw new Error("No se pudo consultar la configuracion DTE");
  }

  const payload = (await response.json()) as ApiSuccess<DteConfig[]>;

  if (!payload.ok) {
    throw new Error("Respuesta API invalida");
  }

  return payload.data;
};

export const updateDteConfig = async (
  configId: number,
  request: DteConfigUpdateRequest
): Promise<DteConfig> => {
  const response = await fetch(`/api/support/control/maintainers/dte-config/${configId}`, {
    body: JSON.stringify({
      ...request,
      confirm: "UPDATE_DTE_CONFIG",
      requestedBy: "frontend-local"
    }),
    headers: {
      "content-type": "application/json"
    },
    method: "PATCH"
  });

  if (!response.ok) {
    throw new Error("No se pudo actualizar la configuracion DTE");
  }

  const payload = (await response.json()) as ApiSuccess<DteConfig>;

  if (!payload.ok) {
    throw new Error("Respuesta API invalida");
  }

  return payload.data;
};

export const getFoliosAlertConfig = async (
  signal?: AbortSignal
): Promise<FoliosAlertConfig[]> => {
  const response = await fetch("/api/support/control/maintainers/folios-alert-config", {
    signal
  });

  if (!response.ok) {
    throw new Error("No se pudo consultar los umbrales de alerta");
  }

  const payload = (await response.json()) as ApiSuccess<FoliosAlertConfig[]>;

  if (!payload.ok) {
    throw new Error("Respuesta API invalida");
  }

  return payload.data;
};

export const updateFoliosAlertConfig = async (
  configId: number,
  request: FoliosAlertConfigUpdateRequest
): Promise<FoliosAlertConfig> => {
  const response = await fetch(
    `/api/support/control/maintainers/folios-alert-config/${configId}`,
    {
      body: JSON.stringify({
        ...request,
        confirm: "UPDATE_FOLIOS_ALERT_CONFIG",
        requestedBy: "frontend-local"
      }),
      headers: {
        "content-type": "application/json"
      },
      method: "PATCH"
    }
  );

  if (!response.ok) {
    throw new Error("No se pudo actualizar los umbrales de alerta");
  }

  const payload = (await response.json()) as ApiSuccess<FoliosAlertConfig>;

  if (!payload.ok) {
    throw new Error("Respuesta API invalida");
  }

  return payload.data;
};

export const refreshLocalCaches = async (): Promise<CacheStatus> => {
  const response = await fetch("/api/support/control/cache-refresh", {
    body: JSON.stringify({
      confirm: "REFRESH_LOCAL_CACHES",
      requestedBy: "frontend-local"
    }),
    headers: {
      "content-type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("No se pudo refrescar caches locales");
  }

  const payload = (await response.json()) as ApiSuccess<CacheStatus>;

  if (!payload.ok) {
    throw new Error("Respuesta API invalida");
  }

  return payload.data;
};

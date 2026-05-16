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
  };
};

export type CompanyControlAlert = "OK" | "WARNING" | "URGENTE" | "SIN_EMISION";
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

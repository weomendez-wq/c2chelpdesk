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

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

export type CompanyDevice = {
  tenant_id: string;
  tenant_name: string | null;
  rut: number | null;
  empresa_name: string | null;
  empresa_status: string | null;
  empresa_comuna: string | null;
  empresa_ciudad: string | null;
  device_id: string | null;
  device_name: string | null;
  device_status: string | null;
  device_local: string | null;
  device_comuna: string | null;
  device_ciudad: string | null;
  anydesk: string | null;
  config_group_name: string | null;
  registration_key_count: number | null;
  active_registration_key_count: number | null;
};

export type CompanyDevicesQuery = {
  limit?: number;
  offset?: number;
  search?: string;
  status?: string;
};

const buildQueryString = (query: CompanyDevicesQuery) => {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

export const getCompanyDevices = async (
  query: CompanyDevicesQuery,
  signal?: AbortSignal
): Promise<PaginatedResponse<CompanyDevice>> => {
  const response = await fetch(`/api/support/company-devices${buildQueryString(query)}`, {
    signal
  });

  if (!response.ok) {
    throw new Error("No se pudo consultar empresas y dispositivos");
  }

  const payload = (await response.json()) as ApiSuccess<PaginatedResponse<CompanyDevice>>;

  if (!payload.ok) {
    throw new Error("Respuesta API invalida");
  }

  return payload.data;
};

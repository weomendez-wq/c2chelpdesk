import { useEffect, useMemo, useState } from "react";
import { MetricCard } from "../components/MetricCard";
import { PaginationBar } from "../components/PaginationBar";
import { TenantSelector } from "../components/TenantSelector";
import {
  getCompanyControl,
  getDeviceControl,
  getDocumentsSummary,
  getFolioRanges,
  getFoliosControl,
  getCacheStatus,
  getDteConfig,
  getOperationalAlerts,
  refreshLocalCaches,
  type AlertSeverity,
  type AlertSource,
  type CacheStatus,
  type CompanyControl,
  type CompanyControlAlert,
  type CompanyControlQuery,
  type DeviceControl,
  type DocumentsSummary,
  type DteConfig,
  type FolioRange,
  type FolioRangeOperationalState,
  type FoliosControl,
  type OperationalAlert
} from "../services/supportApi";

type LoadState<TData> =
  | { status: "idle" | "loading"; data: TData; error: null }
  | { status: "success"; data: TData; error: null }
  | { status: "error"; data: TData; error: string };

const emptyDocumentsSummary: DocumentsSummary = {
  byDocumentType: [],
  filters: {},
  monthly: [],
  totals: {
    companies: 0,
    devices: 0,
    documents: 0,
    documentTypes: 0
  }
};

const statusOptions = [
  { value: "", label: "Todos" },
  { value: "active", label: "Activas" }
];

const alertOptions: Array<{ value: "" | CompanyControlAlert; label: string }> = [
  { value: "", label: "Todas" },
  { value: "OK", label: "OK" },
  { value: "WARNING", label: "Warning" },
  { value: "URGENTE", label: "Urgente" },
  { value: "SIN_EMISION", label: "Sin emision" }
];

const rangeStateOptions: Array<{ value: "" | FolioRangeOperationalState; label: string }> = [
  { value: "", label: "Todos" },
  { value: "CADUCADO_CANDIDATO", label: "Caducado candidato" },
  { value: "POR_OCUPAR", label: "Por ocupar" },
  { value: "EN_USO", label: "En uso" },
  { value: "AGOTADO", label: "Agotado" },
  { value: "REVISION_DATOS", label: "Revision datos" }
];

const operationalAlertOptions: Array<{ value: "" | AlertSeverity; label: string }> = [
  { value: "", label: "Todas" },
  { value: "REVISION_DATOS", label: "Revision datos" },
  { value: "SIN_FOLIOS", label: "Sin folios" },
  { value: "URGENTE", label: "Urgente" },
  { value: "WARNING", label: "Warning" },
  { value: "SIN_EMISION", label: "Sin emision" },
  { value: "SIN_BASE_ESTIMACION", label: "Sin base" }
];

const alertSourceOptions: Array<{ value: "" | AlertSource; label: string }> = [
  { value: "", label: "Todas" },
  { value: "EMPRESA", label: "Empresa" },
  { value: "DEVICE", label: "Device" },
  { value: "FOLIOS", label: "Folios" },
  { value: "AGOTAMIENTO", label: "Agotamiento" },
  { value: "CAF_VENCIMIENTO", label: "Vencimiento CAF" }
];

const navigationItems = [
  { id: "torre-control", label: "Torre de Control", status: "Activo" },
  { id: "empresas", label: "Empresas", status: "Activo" },
  { id: "cajeros", label: "Cajeros / Devices", status: "Activo" },
  { id: "documentos", label: "Documentos", status: "Activo" },
  { id: "folios", label: "Folios / CAF", status: "Activo" },
  { id: "rangos", label: "Rangos SII", status: "Activo" },
  { id: "alertas", label: "Alertas", status: "Activo" },
  { id: "procesos", label: "Procesos", status: "Activo" },
  { id: "mantenedores", label: "Mantenedores", status: "Activo" },
  { id: "configuracion", label: "Configuracion", status: "Plan" }
];

const formatDate = (value: string | null) => {
  if (!value) {
    return "-";
  }

  return value.slice(0, 10);
};
const formatNumber = (value: number) => value.toLocaleString("es-CL");
const formatMaybeNumber = (value: number | null) => (value === null ? "-" : formatNumber(value));
const formatDateTime = (value: string | null) =>
  value ? new Date(value).toLocaleString("es-CL") : "-";
const formatDuration = (value: number | null) => {
  if (value === null) {
    return "-";
  }

  return `${Math.round(value / 1000).toLocaleString("es-CL")} s`;
};

const documentTypeLabel = (documentType: number, label?: string | null) => {
  if (label) {
    return `${documentType} ${label}`;
  }

  const labels: Record<number, string> = {
    33: "Factura electronica",
    39: "Boleta electronica",
    41: "Boleta exenta electronica"
  };

  return `${documentType} ${labels[documentType] ?? "DTE"}`;
};

const formatDays = (value: number | null) => {
  if (value === null) {
    return "-";
  }

  return `${value} dias`;
};

const LoadingIndicator = ({ label }: { label: string }) => (
  <div className="loading-indicator" role="status" aria-live="polite">
    <span className="spinner" aria-hidden="true" />
    <span>{label}</span>
  </div>
);

const emptyCacheStatus: CacheStatus = {
  currentCounts: {},
  lastRefresh: null
};

export const App = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [alert, setAlert] = useState<"" | CompanyControlAlert>("");
  const [selectedCompany, setSelectedCompany] = useState<CompanyControl | null>(null);
  const [companyLimit, setCompanyLimit] = useState(25);
  const [companyOffset, setCompanyOffset] = useState(0);
  const [companyTotal, setCompanyTotal] = useState<number | undefined>();
  const [deviceLimit, setDeviceLimit] = useState(25);
  const [deviceOffset, setDeviceOffset] = useState(0);
  const [deviceTotal, setDeviceTotal] = useState<number | undefined>();
  const [foliosLimit, setFoliosLimit] = useState(100);
  const [foliosOffset, setFoliosOffset] = useState(0);
  const [foliosTotal, setFoliosTotal] = useState<number | undefined>();
  const [rangesLimit, setRangesLimit] = useState(50);
  const [rangesOffset, setRangesOffset] = useState(0);
  const [rangesTotal, setRangesTotal] = useState<number | undefined>();
  const [rangeState, setRangeState] = useState<"" | FolioRangeOperationalState>("");
  const [alertsLimit, setAlertsLimit] = useState(50);
  const [alertsOffset, setAlertsOffset] = useState(0);
  const [alertsTotal, setAlertsTotal] = useState<number | undefined>();
  const [operationalAlert, setOperationalAlert] = useState<"" | AlertSeverity>("");
  const [alertSource, setAlertSource] = useState<"" | AlertSource>("");
  const [companyState, setCompanyState] = useState<LoadState<CompanyControl[]>>({
    status: "idle",
    data: [],
    error: null
  });
  const [documentsState, setDocumentsState] = useState<LoadState<DocumentsSummary>>({
    status: "idle",
    data: emptyDocumentsSummary,
    error: null
  });
  const [deviceState, setDeviceState] = useState<LoadState<DeviceControl[]>>({
    status: "idle",
    data: [],
    error: null
  });
  const [foliosState, setFoliosState] = useState<LoadState<FoliosControl[]>>({
    status: "idle",
    data: [],
    error: null
  });
  const [rangesState, setRangesState] = useState<LoadState<FolioRange[]>>({
    status: "idle",
    data: [],
    error: null
  });
  const [alertsState, setAlertsState] = useState<LoadState<OperationalAlert[]>>({
    status: "idle",
    data: [],
    error: null
  });
  const [cacheState, setCacheState] = useState<LoadState<CacheStatus>>({
    status: "idle",
    data: emptyCacheStatus,
    error: null
  });
  const [dteConfigState, setDteConfigState] = useState<LoadState<DteConfig[]>>({
    status: "idle",
    data: [],
    error: null
  });
  const [cacheRefreshRunning, setCacheRefreshRunning] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();
    const query: CompanyControlQuery = {
      limit: companyLimit,
      offset: companyOffset,
      search: search.trim() || undefined,
      status: status || undefined,
      alert: alert || undefined
    };

    setCompanyState((current) => ({
      status: "loading",
      data: current.data,
      error: null
    }));

    getCompanyControl(query, abortController.signal)
      .then((response) => {
        setCompanyState({
          status: "success",
          data: response.items,
          error: null
        });
        setCompanyTotal(response.pagination.total);
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) {
          return;
        }

        setCompanyState({
          status: "error",
          data: [],
          error: error instanceof Error ? error.message : "No se pudo cargar la informacion"
        });
      });

    return () => abortController.abort();
  }, [alert, companyLimit, companyOffset, search, status]);

  useEffect(() => {
    setCompanyOffset(0);
    setDeviceOffset(0);
  }, [alert, search, status]);

  useEffect(() => {
    const abortController = new AbortController();
    const query =
      selectedCompany?.tenant_id && selectedCompany.rut
        ? {
            rut: selectedCompany.rut,
            tenantId: selectedCompany.tenant_id
          }
        : {};

    setDocumentsState((current) => ({
      status: "loading",
      data: current.data,
      error: null
    }));

    getDocumentsSummary(query, abortController.signal)
      .then((response) => {
        setDocumentsState({
          status: "success",
          data: response,
          error: null
        });
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) {
          return;
        }

        setDocumentsState({
          status: "error",
          data: emptyDocumentsSummary,
          error: error instanceof Error ? error.message : "No se pudo cargar documentos"
        });
      });

    return () => abortController.abort();
  }, [selectedCompany]);

  useEffect(() => {
    const abortController = new AbortController();
    const query =
      selectedCompany?.tenant_id && selectedCompany.rut
        ? {
            limit: deviceLimit,
            offset: deviceOffset,
            rut: selectedCompany.rut,
            tenantId: selectedCompany.tenant_id
          }
        : {
            limit: deviceLimit,
            offset: deviceOffset,
            alert: alert || undefined,
            search: search.trim() || undefined,
            status: status || undefined
          };

    setDeviceState((current) => ({
      status: "loading",
      data: current.data,
      error: null
    }));

    getDeviceControl(query, abortController.signal)
      .then((response) => {
        setDeviceState({
          status: "success",
          data: response.items,
          error: null
        });
        setDeviceTotal(response.pagination.total);
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) {
          return;
        }

        setDeviceState({
          status: "error",
          data: [],
          error: error instanceof Error ? error.message : "No se pudo cargar devices"
        });
      });

    return () => abortController.abort();
  }, [alert, deviceLimit, deviceOffset, search, selectedCompany, status]);

  useEffect(() => {
    setDeviceOffset(0);
  }, [selectedCompany]);

  useEffect(() => {
    const abortController = new AbortController();
    const query =
      selectedCompany?.tenant_id && selectedCompany.rut
        ? {
            limit: foliosLimit,
            offset: foliosOffset,
            rut: selectedCompany.rut,
            tenantId: selectedCompany.tenant_id
          }
        : {
            limit: foliosLimit,
            offset: foliosOffset,
            search: search.trim() || undefined
          };

    setFoliosState((current) => ({
      status: "loading",
      data: current.data,
      error: null
    }));

    getFoliosControl(query, abortController.signal)
      .then((response) => {
        setFoliosState({
          status: "success",
          data: response.items,
          error: null
        });
        setFoliosTotal(response.pagination.total);
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) {
          return;
        }

        setFoliosState({
          status: "error",
          data: [],
          error: error instanceof Error ? error.message : "No se pudo cargar folios"
        });
      });

    return () => abortController.abort();
  }, [foliosLimit, foliosOffset, search, selectedCompany]);

  useEffect(() => {
    setFoliosOffset(0);
  }, [search, selectedCompany]);

  useEffect(() => {
    const abortController = new AbortController();
    const query =
      selectedCompany?.tenant_id && selectedCompany.rut
        ? {
            estadoOperativo: rangeState || undefined,
            limit: rangesLimit,
            offset: rangesOffset,
            rut: selectedCompany.rut,
            tenantId: selectedCompany.tenant_id
          }
        : {
            estadoOperativo: rangeState || undefined,
            limit: rangesLimit,
            offset: rangesOffset,
            search: search.trim() || undefined
          };

    setRangesState((current) => ({
      status: "loading",
      data: current.data,
      error: null
    }));

    getFolioRanges(query, abortController.signal)
      .then((response) => {
        setRangesState({
          status: "success",
          data: response.items,
          error: null
        });
        setRangesTotal(response.pagination.total);
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) {
          return;
        }

        setRangesState({
          status: "error",
          data: [],
          error: error instanceof Error ? error.message : "No se pudo cargar rangos SII"
        });
      });

    return () => abortController.abort();
  }, [rangeState, rangesLimit, rangesOffset, search, selectedCompany]);

  useEffect(() => {
    setRangesOffset(0);
  }, [rangeState, search, selectedCompany]);

  useEffect(() => {
    const abortController = new AbortController();
    const query =
      selectedCompany?.tenant_id && selectedCompany.rut
        ? {
            limit: alertsLimit,
            offset: alertsOffset,
            rut: selectedCompany.rut,
            severity: operationalAlert || undefined,
            source: alertSource || undefined,
            tenantId: selectedCompany.tenant_id
          }
        : {
            limit: alertsLimit,
            offset: alertsOffset,
            search: search.trim() || undefined,
            severity: operationalAlert || undefined,
            source: alertSource || undefined
          };

    setAlertsState((current) => ({
      status: "loading",
      data: current.data,
      error: null
    }));

    getOperationalAlerts(query, abortController.signal)
      .then((response) => {
        setAlertsState({
          status: "success",
          data: response.items,
          error: null
        });
        setAlertsTotal(response.pagination.total);
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) {
          return;
        }

        setAlertsState({
          status: "error",
          data: [],
          error: error instanceof Error ? error.message : "No se pudo cargar alertas"
        });
      });

    return () => abortController.abort();
  }, [alertSource, alertsLimit, alertsOffset, operationalAlert, search, selectedCompany]);

  useEffect(() => {
    setAlertsOffset(0);
  }, [alertSource, operationalAlert, search, selectedCompany]);

  useEffect(() => {
    const abortController = new AbortController();

    setCacheState((current) => ({
      status: "loading",
      data: current.data,
      error: null
    }));

    getCacheStatus(abortController.signal)
      .then((response) => {
        setCacheState({
          status: "success",
          data: response,
          error: null
        });
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) {
          return;
        }

        setCacheState({
          status: "error",
          data: emptyCacheStatus,
          error: error instanceof Error ? error.message : "No se pudo cargar estado de caches"
        });
      });

    return () => abortController.abort();
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    setDteConfigState((current) => ({
      status: "loading",
      data: current.data,
      error: null
    }));

    getDteConfig(abortController.signal)
      .then((response) => {
        setDteConfigState({
          status: "success",
          data: response,
          error: null
        });
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) {
          return;
        }

        setDteConfigState({
          status: "error",
          data: [],
          error: error instanceof Error ? error.message : "No se pudo cargar configuracion DTE"
        });
      });

    return () => abortController.abort();
  }, []);

  const handleRefreshCaches = () => {
    setCacheRefreshRunning(true);
    setCacheState((current) => ({
      status: "loading",
      data: current.data,
      error: null
    }));

    refreshLocalCaches()
      .then((response) => {
        setCacheState({
          status: "success",
          data: response,
          error: null
        });
      })
      .catch((error: unknown) => {
        setCacheState((current) => ({
          status: "error",
          data: current.data,
          error: error instanceof Error ? error.message : "No se pudo refrescar caches"
        }));
      })
      .finally(() => setCacheRefreshRunning(false));
  };

  const companySummary = useMemo(() => {
    const total = companyState.data.length;
    const active = companyState.data.filter((item) => item.empresa_status === "active").length;
    const withoutEmission = companyState.data.filter(
      (item) => item.nivel_alerta_emision === "SIN_EMISION"
    ).length;
    const urgent = companyState.data.filter((item) => item.nivel_alerta_emision === "URGENTE").length;

    return {
      active,
      total,
      urgent,
      withoutEmission
    };
  }, [companyState.data]);

  const maxMonthlyDocuments = Math.max(
    1,
    ...documentsState.data.monthly.map((item) => item.documents)
  );

  const deviceSummary = useMemo(() => {
    const total = deviceState.data.length;
    const active = deviceState.data.filter((item) => item.device_status === "active").length;
    const withoutEmission = deviceState.data.filter(
      (item) => item.nivel_alerta_emision === "SIN_EMISION"
    ).length;
    const urgent = deviceState.data.filter((item) => item.nivel_alerta_emision === "URGENTE").length;

    return {
      active,
      total,
      urgent,
      withoutEmission
    };
  }, [deviceState.data]);

  const foliosSummary = useMemo(() => {
    const totals = foliosState.data.reduce(
      (accumulator, item) => ({
        caf: accumulator.caf + item.caf_count,
        disponibles: accumulator.disponibles + item.folios_disponibles,
        otorgados: accumulator.otorgados + item.folios_otorgados,
        revision:
          accumulator.revision + (item.nivel_alerta_folios === "REVISION_DATOS" ? 1 : 0),
        warning:
          accumulator.warning +
          (item.nivel_alerta_folios === "WARNING" || item.nivel_alerta_folios === "URGENTE"
            ? 1
            : 0)
      }),
      { caf: 0, disponibles: 0, otorgados: 0, revision: 0, warning: 0 }
    );

    return totals;
  }, [foliosState.data]);

  const rangesSummary = useMemo(() => {
    return rangesState.data.reduce(
      (accumulator, item) => ({
        anteriores:
          accumulator.anteriores + (item.clasificacion_temporal === "RANGOANTERIOR" ? 1 : 0),
        candidatos:
          accumulator.candidatos + (item.estado_operativo_rango === "CADUCADO_CANDIDATO" ? 1 : 0),
        cafPorVencer:
          accumulator.cafPorVencer +
          (item.nivel_alerta_caf_vencimiento === "WARNING" ||
          item.nivel_alerta_caf_vencimiento === "URGENTE"
            ? 1
            : 0),
        lostFolios: accumulator.lostFolios + item.lost_folios,
        rangos: accumulator.rangos + 1,
        sinUso: accumulator.sinUso + (item.estado_rango === "RANGOSINUSO" ? 1 : 0)
      }),
      { anteriores: 0, cafPorVencer: 0, candidatos: 0, lostFolios: 0, rangos: 0, sinUso: 0 }
    );
  }, [rangesState.data]);

  const alertsSummary = useMemo(() => {
    return alertsState.data.reduce(
      (accumulator, item) => ({
        folios:
          accumulator.folios +
          (item.source === "FOLIOS" ||
          item.source === "AGOTAMIENTO" ||
          item.source === "CAF_VENCIMIENTO"
            ? 1
            : 0),
        revision: accumulator.revision + (item.severity === "REVISION_DATOS" ? 1 : 0),
        sinBase: accumulator.sinBase + (item.severity === "SIN_BASE_ESTIMACION" ? 1 : 0),
        total: accumulator.total + 1,
        urgent:
          accumulator.urgent +
          (item.severity === "URGENTE" || item.severity === "SIN_FOLIOS" ? 1 : 0)
      }),
      { folios: 0, revision: 0, sinBase: 0, total: 0, urgent: 0 }
    );
  }, [alertsState.data]);

  return (
    <div className="product-shell">
      <aside className="sidebar" aria-label="Modulos C2C Helpdesk">
        <div className="brand-block">
          <span className="brand-mark">C2C</span>
          <div>
            <p className="eyebrow">Helpdesk</p>
            <strong>Soporte DTE</strong>
          </div>
        </div>
        <nav className="module-nav" aria-label="Navegacion principal">
          {navigationItems.map((item) => (
            <a className="module-link" href={`#${item.id}`} key={item.id}>
              <span>{item.label}</span>
              <small className={item.status === "Activo" ? "is-active" : ""}>{item.status}</small>
            </a>
          ))}
        </nav>
      </aside>

      <main className="app-shell">
        <section className="toolbar" aria-label="Filtros principales">
          <div>
            <p className="eyebrow">C2C Soporte</p>
            <h1>Control operativo helpdesk</h1>
            <p className="compact-id">Vista centralizada por empresa, tenant, folios y cajeros</p>
          </div>
          <TenantSelector
            companies={companyState.data}
            loading={companyState.status === "loading"}
            selectedCompany={selectedCompany}
            onSelect={setSelectedCompany}
          />
          <div className="filters">
            <label className="field">
              <span>Buscar</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Empresa, RUT o tenant"
              />
            </label>
            <label className="field">
              <span>Estado</span>
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Alerta</span>
              <select
                value={alert}
                onChange={(event) => setAlert(event.target.value as "" | CompanyControlAlert)}
              >
                {alertOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

      <section className="metrics" id="torre-control" aria-label="Torre de control">
        <MetricCard
          label="Empresas"
          value={formatNumber(companyTotal ?? companySummary.total)}
          helper={`${formatNumber(companySummary.total)} visibles`}
        />
        <MetricCard label="Activas" value={formatNumber(companySummary.active)} tone="success" />
        <MetricCard
          label="Sin emision"
          value={formatNumber(companySummary.withoutEmission)}
          tone="warning"
        />
        <MetricCard label="Urgentes" value={formatNumber(companySummary.urgent)} tone="urgent" />
      </section>

      <section className="detail-panel" id="documentos" aria-label="Resumen documental">
        <div className="detail-heading">
          <div>
            <p className="eyebrow">Documentos 2026</p>
            <h2>{selectedCompany?.empresa_name ?? "Resumen general"}</h2>
            <p className="compact-id">
              {selectedCompany
                ? `Tenant ${selectedCompany.tenant_id} | RUT ${selectedCompany.rut ?? "-"}`
                : "Todas las empresas con documentos 2026"}
            </p>
          </div>
          {selectedCompany ? (
            <button className="ghost-button" type="button" onClick={() => setSelectedCompany(null)}>
              Ver general
            </button>
          ) : null}
        </div>

        {documentsState.status === "error" ? (
          <p className="status error">{documentsState.error}</p>
        ) : null}
        {documentsState.status === "loading" ? (
          <LoadingIndicator label="Cargando resumen documental..." />
        ) : null}

        <div className="metrics documents">
          <MetricCard label="Total emitidos" value={formatNumber(documentsState.data.totals.documents)} />
          <MetricCard label="Empresas con docs" value={formatNumber(documentsState.data.totals.companies)} />
          <MetricCard label="Devices con docs" value={formatNumber(documentsState.data.totals.devices)} />
          <MetricCard label="Tipos DTE" value={formatNumber(documentsState.data.totals.documentTypes)} />
        </div>

        <div className="analytics-grid">
          <div className="chart-panel">
            <h3>Emision mensual</h3>
            <div className="month-chart" aria-label="Grafico mensual documentos emitidos">
              {documentsState.data.monthly.map((item) => (
                <div className="month-row" key={item.period}>
                  <span>{item.period}</span>
                  <div className="month-track">
                    <div
                      className="month-bar"
                      style={{ width: `${Math.max(2, (item.documents / maxMonthlyDocuments) * 100)}%` }}
                    />
                  </div>
                  <strong>{formatNumber(item.documents)}</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="chart-panel">
            <h3>Por tipo documento</h3>
            <div className="doc-type-list">
              {documentsState.data.byDocumentType.map((item) => (
                <div className="doc-type-row" key={item.documentType}>
                  <span>{documentTypeLabel(item.documentType)}</span>
                  <strong>{formatNumber(item.documents)}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="detail-panel" id="folios" aria-label="Control folios y CAF">
        <div className="detail-heading">
          <div>
            <p className="eyebrow">Folios y CAF</p>
            <h2>{selectedCompany?.empresa_name ?? "Control global por prioridad"}</h2>
            <p className="compact-id">
              {selectedCompany
                ? `Tenant ${selectedCompany.tenant_id} | RUT ${selectedCompany.rut ?? "-"}`
                : "CAF, folios disponibles, historial y documentos emitidos 2026"}
            </p>
          </div>
        </div>

        {foliosState.status === "error" ? <p className="status error">{foliosState.error}</p> : null}
        {foliosState.status === "loading" ? (
          <LoadingIndicator label="Cargando control de folios..." />
        ) : null}

        <div className="metrics documents">
          <MetricCard
            label="CAF"
            value={formatNumber(foliosSummary.caf)}
            helper={`${formatNumber(foliosTotal ?? foliosState.data.length)} combinaciones`}
          />
          <MetricCard
            label="Otorgados"
            value={formatNumber(foliosSummary.otorgados)}
            helper="Segun filas visibles"
            tone="info"
          />
          <MetricCard
            label="Disponibles"
            value={formatNumber(foliosSummary.disponibles)}
            helper="Segun filas visibles"
            tone="success"
          />
          <MetricCard
            label="Revision"
            value={formatNumber(foliosSummary.revision)}
            helper={`${formatNumber(foliosSummary.warning)} warning/urgente visibles`}
            tone={foliosSummary.revision > 0 ? "urgent" : "success"}
          />
        </div>

        <div className="table-wrap compact-table" aria-label="Tabla control folios">
          <table>
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Tipo</th>
                <th>Alerta</th>
                <th>CAF</th>
                <th>Otorgados</th>
                <th>Disponibles</th>
                <th>Solicitados</th>
                <th>Entregados</th>
                <th>Diferencia</th>
                <th>Docs 2026</th>
              </tr>
            </thead>
            <tbody>
              {foliosState.data.map((item) => (
                <tr key={`${item.tenant_id}-${item.rut}-${item.document_type}`}>
                  <td>
                    <strong className="table-title">{item.empresa_name ?? item.tenant_name}</strong>
                    <span className="table-subtitle">
                      RUT {item.rut ?? "-"} | Tenant {item.tenant_id}
                    </span>
                  </td>
                  <td>{documentTypeLabel(item.document_type)}</td>
                  <td>
                    <span className={`badge alert-${item.nivel_alerta_folios.toLowerCase()}`}>
                      {item.nivel_alerta_folios}
                    </span>
                  </td>
                  <td>{formatNumber(item.caf_count)}</td>
                  <td>{formatNumber(item.folios_otorgados)}</td>
                  <td>{formatNumber(item.folios_disponibles)}</td>
                  <td>{formatNumber(item.folios_solicitados)}</td>
                  <td>{formatNumber(item.folios_entregados_por_rango)}</td>
                  <td>{formatNumber(item.diferencia_solicitado_rango)}</td>
                  <td>{formatNumber(item.documentos_emitidos_2026)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {foliosState.status === "success" && foliosState.data.length === 0 ? (
            <p className="empty">No hay folios para los filtros seleccionados.</p>
          ) : null}
          <PaginationBar
            itemCount={foliosState.data.length}
            limit={foliosLimit}
            offset={foliosOffset}
            total={foliosTotal}
            onLimitChange={(nextLimit) => {
              setFoliosLimit(nextLimit);
              setFoliosOffset(0);
            }}
            onOffsetChange={setFoliosOffset}
          />
        </div>
      </section>

      <section className="detail-panel" id="cajeros" aria-label="Control devices">
        <div className="detail-heading">
          <div>
            <p className="eyebrow">Devices operativos</p>
            <h2>{selectedCompany?.empresa_name ?? "Primeros 100 devices por prioridad"}</h2>
            <p className="compact-id">
              {selectedCompany
                ? `Tenant ${selectedCompany.tenant_id} | RUT ${selectedCompany.rut ?? "-"}`
                : "Filtro general segun busqueda, estado y alerta"}
            </p>
          </div>
        </div>

        {deviceState.status === "error" ? <p className="status error">{deviceState.error}</p> : null}
        {deviceState.status === "loading" ? (
          <LoadingIndicator label="Cargando control de devices..." />
        ) : null}

        <div className="metrics documents">
          <MetricCard
            label="Devices"
            value={formatNumber(deviceTotal ?? deviceSummary.total)}
            helper={`${formatNumber(deviceSummary.total)} visibles`}
          />
          <MetricCard label="Activos" value={formatNumber(deviceSummary.active)} tone="success" />
          <MetricCard label="Sin emision" value={formatNumber(deviceSummary.withoutEmission)} tone="warning" />
          <MetricCard label="Urgentes" value={formatNumber(deviceSummary.urgent)} tone="urgent" />
        </div>

        <div className="table-wrap compact-table" aria-label="Tabla control devices">
          <table>
            <thead>
              <tr>
                <th>Device</th>
                <th>Estado</th>
                <th>Garantia</th>
                <th>Alerta</th>
                <th>Consistencia</th>
                <th>Docs 2026</th>
                <th>Ultima emision</th>
                <th>Dias sin emitir</th>
                <th>Local</th>
              </tr>
            </thead>
            <tbody>
              {deviceState.data.map((item) => (
                <tr key={`${item.tenant_id}-${item.device_id}`}>
                  <td>
                    <strong className="table-title">{item.device_name ?? item.device_id}</strong>
                    <span className="table-subtitle">{item.device_id}</span>
                  </td>
                  <td>
                    <span className={`badge ${item.device_status ?? ""}`}>{item.device_status}</span>
                  </td>
                  <td>{item.estado_garantia}</td>
                  <td>
                    <span className={`badge alert-${item.nivel_alerta_emision.toLowerCase()}`}>
                      {item.nivel_alerta_emision}
                    </span>
                  </td>
                  <td>{item.alerta_consistencia}</td>
                  <td>{formatNumber(item.documentos_emitidos_2026)}</td>
                  <td>{formatDate(item.ultima_emision)}</td>
                  <td>{formatDays(item.dias_sin_emitir)}</td>
                  <td>{item.local ?? item.comuna ?? item.ciudad ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {deviceState.status === "success" && deviceState.data.length === 0 ? (
            <p className="empty">No hay devices para los filtros seleccionados.</p>
          ) : null}
          <PaginationBar
            itemCount={deviceState.data.length}
            limit={deviceLimit}
            offset={deviceOffset}
            total={deviceTotal}
            onLimitChange={(nextLimit) => {
              setDeviceLimit(nextLimit);
              setDeviceOffset(0);
            }}
            onOffsetChange={setDeviceOffset}
          />
        </div>
      </section>

      {companyState.status === "error" ? <p className="status error">{companyState.error}</p> : null}
      {companyState.status === "loading" ? (
        <LoadingIndicator label="Cargando datos certificados..." />
      ) : null}

      <section className="table-wrap" id="empresas" aria-label="Control empresas">
        <table>
          <thead>
            <tr>
              <th>Empresa</th>
              <th>RUT</th>
              <th>Estado</th>
              <th>Alerta</th>
              <th>Docs 2026</th>
              <th>Primera emision</th>
              <th>Ultima emision</th>
              <th>Dias sin emitir</th>
              <th>Comuna</th>
            </tr>
          </thead>
          <tbody>
            {companyState.data.map((item) => {
              const selected =
                selectedCompany?.tenant_id === item.tenant_id && selectedCompany.rut === item.rut;

              return (
                <tr
                  className={selected ? "selected-row" : ""}
                  key={`${item.tenant_id}-${item.rut}`}
                  onClick={() => setSelectedCompany(item)}
                >
                  <td>
                    <strong className="table-title">{item.empresa_name}</strong>
                    <span className="table-subtitle">{item.tenant_id}</span>
                  </td>
                  <td>{item.rut}</td>
                  <td>
                    <span className={`badge ${item.empresa_status ?? ""}`}>{item.empresa_status}</span>
                  </td>
                  <td>
                    <span className={`badge alert-${item.nivel_alerta_emision.toLowerCase()}`}>
                      {item.nivel_alerta_emision}
                    </span>
                  </td>
                  <td>{formatNumber(item.documentos_emitidos_2026)}</td>
                  <td>{formatDate(item.primera_emision)}</td>
                  <td>{formatDate(item.ultima_emision)}</td>
                  <td>{formatDays(item.dias_sin_emitir)}</td>
                  <td>{item.comuna ?? item.ciudad ?? "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {companyState.status === "success" && companyState.data.length === 0 ? (
          <p className="empty">No hay empresas para los filtros seleccionados.</p>
        ) : null}
        <PaginationBar
          itemCount={companyState.data.length}
          limit={companyLimit}
          offset={companyOffset}
          total={companyTotal}
          onLimitChange={(nextLimit) => {
            setCompanyLimit(nextLimit);
            setCompanyOffset(0);
          }}
          onOffsetChange={setCompanyOffset}
        />
      </section>

        <section className="module-planning-grid" aria-label="Modulos planificados">
          <article className="planning-card ranges-card" id="rangos">
            <div className="detail-heading">
              <div>
                <p className="eyebrow">Rangos SII</p>
                <h2>Rangos clasificados</h2>
                <p className="compact-id">
                  {selectedCompany
                    ? `Tenant ${selectedCompany.tenant_id} | RUT ${selectedCompany.rut ?? "-"}`
                    : "Rangos CAF clasificados para revision operativa"}
                </p>
              </div>
              <label className="field inline-field">
                <span>Estado</span>
                <select
                  value={rangeState}
                  onChange={(event) =>
                    setRangeState(event.target.value as "" | FolioRangeOperationalState)
                  }
                >
                  {rangeStateOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {rangesState.status === "error" ? (
              <p className="status error">{rangesState.error}</p>
            ) : null}
            {rangesState.status === "loading" ? (
              <LoadingIndicator label="Cargando rangos SII..." />
            ) : null}

            <div className="metrics documents">
              <MetricCard
                label="Rangos"
                value={formatNumber(rangesTotal ?? rangesSummary.rangos)}
                helper={`${formatNumber(rangesSummary.rangos)} visibles`}
              />
              <MetricCard
                label="Candidatos"
                value={formatNumber(rangesSummary.candidatos)}
                helper="Caducado candidato"
                tone="warning"
              />
              <MetricCard
                label="Anteriores"
                value={formatNumber(rangesSummary.anteriores)}
                helper="Clasificacion temporal"
                tone="info"
              />
              <MetricCard
                label="CAF 33 alerta"
                value={formatNumber(rangesSummary.cafPorVencer)}
                helper={`${formatNumber(rangesSummary.lostFolios)} lost folios`}
                tone={rangesSummary.cafPorVencer > 0 ? "urgent" : "success"}
              />
            </div>

            <div className="table-wrap compact-table" aria-label="Tabla rangos SII">
              <table>
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Temporal</th>
                    <th>CAF</th>
                    <th>Rango</th>
                    <th>Total</th>
                    <th>Ocupado</th>
                    <th>Desocupado</th>
                    <th>Lost</th>
                    <th>Vence CAF</th>
                    <th>Ultima emision</th>
                  </tr>
                </thead>
                <tbody>
                  {rangesState.data.map((item) => (
                    <tr
                      key={`${item.tenant_id}-${item.rut}-${item.document_type}-${item.cafserial}-${item.folio_ini}-${item.folio_fin}`}
                    >
                      <td>
                        <strong className="table-title">{item.empresa_name ?? item.tenant_name}</strong>
                        <span className="table-subtitle">
                          RUT {item.rut ?? "-"} | Tenant {item.tenant_id}
                        </span>
                      </td>
                      <td>{documentTypeLabel(item.document_type, item.document_label)}</td>
                      <td>
                        <span className={`badge range-${item.estado_operativo_rango.toLowerCase()}`}>
                          {item.estado_operativo_rango}
                        </span>
                      </td>
                      <td>{item.clasificacion_temporal}</td>
                      <td>{item.cafserial ?? "-"}</td>
                      <td>
                        {formatNumber(item.folio_ini)} - {formatNumber(item.folio_fin)}
                      </td>
                      <td>{formatNumber(item.total_rango)}</td>
                      <td>{formatNumber(item.total_ocupado)}</td>
                      <td>{formatNumber(item.total_documentos_desocupados)}</td>
                      <td>{formatNumber(item.lost_folios)}</td>
                      <td>
                        {item.nivel_alerta_caf_vencimiento ? (
                          <>
                            <span
                              className={`badge alert-${item.nivel_alerta_caf_vencimiento.toLowerCase()}`}
                            >
                              {item.nivel_alerta_caf_vencimiento}
                            </span>
                            <span className="table-subtitle">
                              {formatDate(item.caf_fecha_vencimiento)}
                              {item.caf_dias_para_vencer !== null
                                ? ` | ${item.caf_dias_para_vencer} dias`
                                : ""}
                            </span>
                          </>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>{formatDate(item.fecha_ultima_emision)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {rangesState.status === "success" && rangesState.data.length === 0 ? (
                <p className="empty">No hay rangos SII para los filtros seleccionados.</p>
              ) : null}
              <PaginationBar
                itemCount={rangesState.data.length}
                limit={rangesLimit}
                offset={rangesOffset}
                total={rangesTotal}
                onLimitChange={(nextLimit) => {
                  setRangesLimit(nextLimit);
                  setRangesOffset(0);
                }}
                onOffsetChange={setRangesOffset}
              />
            </div>
          </article>
          <article className="planning-card alerts-card" id="alertas">
            <div className="detail-heading">
              <div>
                <p className="eyebrow">Alertas</p>
                <h2>Bandeja operacional</h2>
                <p className="compact-id">
                  {selectedCompany
                    ? `Tenant ${selectedCompany.tenant_id} | RUT ${selectedCompany.rut ?? "-"}`
                    : "Empresas, devices, folios y agotamiento"}
                </p>
              </div>
              <div className="inline-filters">
                <label className="field inline-field">
                  <span>Severidad</span>
                  <select
                    value={operationalAlert}
                    onChange={(event) =>
                      setOperationalAlert(event.target.value as "" | AlertSeverity)
                    }
                  >
                    {operationalAlertOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field inline-field">
                  <span>Fuente</span>
                  <select
                    value={alertSource}
                    onChange={(event) => setAlertSource(event.target.value as "" | AlertSource)}
                  >
                    {alertSourceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {alertsState.status === "error" ? (
              <p className="status error">{alertsState.error}</p>
            ) : null}
            {alertsState.status === "loading" ? (
              <LoadingIndicator label="Cargando alertas operacionales..." />
            ) : null}

            <div className="metrics documents">
              <MetricCard
                label="Alertas"
                value={formatNumber(alertsTotal ?? alertsSummary.total)}
                helper={`${formatNumber(alertsSummary.total)} visibles`}
              />
              <MetricCard
                label="Urgentes"
                value={formatNumber(alertsSummary.urgent)}
                helper="Urgente o sin folios"
                tone={alertsSummary.urgent > 0 ? "urgent" : "success"}
              />
              <MetricCard
                label="Revision"
                value={formatNumber(alertsSummary.revision)}
                helper="Diferencias de datos"
                tone={alertsSummary.revision > 0 ? "warning" : "success"}
              />
              <MetricCard
                label="Folios"
                value={formatNumber(alertsSummary.folios)}
                helper={`${formatNumber(alertsSummary.sinBase)} sin base`}
                tone={alertsSummary.folios > 0 ? "info" : "success"}
              />
            </div>

            <div className="table-wrap compact-table" aria-label="Tabla alertas operacionales">
              <table>
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>Fuente</th>
                    <th>Severidad</th>
                    <th>Detalle</th>
                    <th>Entidad</th>
                    <th>Metrica</th>
                    <th>Referencia</th>
                  </tr>
                </thead>
                <tbody>
                  {alertsState.data.map((item, index) => (
                    <tr
                      key={`${item.source}-${item.tenant_id}-${item.rut}-${item.entity_id ?? "empresa"}-${item.document_type ?? "na"}-${index}`}
                    >
                      <td>
                        <strong className="table-title">{item.empresa_name ?? item.tenant_name}</strong>
                        <span className="table-subtitle">
                          RUT {item.rut ?? "-"} | Tenant {item.tenant_id}
                        </span>
                      </td>
                      <td>{item.source}</td>
                      <td>
                        <span className={`badge alert-${item.severity.toLowerCase()}`}>
                          {item.severity}
                        </span>
                      </td>
                      <td>
                        <strong className="table-title">{item.title}</strong>
                        <span className="table-subtitle">{item.detail}</span>
                      </td>
                      <td>{item.entity_id ?? (item.document_type ? `DTE ${item.document_type}` : "-")}</td>
                      <td>
                        {formatMaybeNumber(item.metric_value)}
                        {item.metric_secondary !== null ? (
                          <span className="table-subtitle">
                            Ref. {formatMaybeNumber(item.metric_secondary)}
                          </span>
                        ) : null}
                      </td>
                      <td>{formatDate(item.reference_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {alertsState.status === "success" && alertsState.data.length === 0 ? (
                <p className="empty">No hay alertas para los filtros seleccionados.</p>
              ) : null}
              <PaginationBar
                itemCount={alertsState.data.length}
                limit={alertsLimit}
                offset={alertsOffset}
                total={alertsTotal}
                onLimitChange={(nextLimit) => {
                  setAlertsLimit(nextLimit);
                  setAlertsOffset(0);
                }}
                onOffsetChange={setAlertsOffset}
              />
            </div>
          </article>
          <article className="planning-card process-card" id="procesos">
            <div className="detail-heading">
              <div>
                <p className="eyebrow">Procesos</p>
                <h2>Refresco caches locales</h2>
                <p className="compact-id">
                  Regenera datos rapidos desde vistas locales `rr_gestion_soporte`
                </p>
              </div>
              <button
                className="primary-button"
                disabled={cacheRefreshRunning}
                type="button"
                onClick={handleRefreshCaches}
              >
                {cacheRefreshRunning ? "Refrescando..." : "Refrescar caches"}
              </button>
            </div>

            {cacheState.status === "error" ? (
              <p className="status error">{cacheState.error}</p>
            ) : null}
            {cacheState.status === "loading" || cacheRefreshRunning ? (
              <LoadingIndicator label="Procesando caches locales..." />
            ) : null}

            <div className="metrics documents">
              <MetricCard
                label="Estado"
                value={cacheState.data.lastRefresh?.status ?? "Sin ejecucion"}
                helper={cacheState.data.lastRefresh?.message ?? "Auditoria local"}
                tone={cacheState.data.lastRefresh?.status === "SUCCESS" ? "success" : "info"}
              />
              <MetricCard
                label="Duracion"
                value={formatDuration(cacheState.data.lastRefresh?.durationMs ?? null)}
                helper="Ultimo refresh"
                tone="info"
              />
              <MetricCard
                label="Alertas cache"
                value={formatNumber(cacheState.data.currentCounts.alertas_operativas_cache ?? 0)}
                helper="Bandeja operacional"
                tone="warning"
              />
              <MetricCard
                label="Rangos cache"
                value={formatNumber(
                  cacheState.data.currentCounts.folios_rangos_clasificados_cache ?? 0
                )}
                helper="Rangos SII"
                tone="info"
              />
            </div>

            <div className="cache-status-grid">
              <div>
                <span>Inicio</span>
                <strong>{formatDateTime(cacheState.data.lastRefresh?.startedAt ?? null)}</strong>
              </div>
              <div>
                <span>Termino</span>
                <strong>{formatDateTime(cacheState.data.lastRefresh?.finishedAt ?? null)}</strong>
              </div>
              <div>
                <span>Solicitado por</span>
                <strong>{cacheState.data.lastRefresh?.requestedBy ?? "-"}</strong>
              </div>
              <div>
                <span>ID refresh</span>
                <strong>{cacheState.data.lastRefresh?.refreshId ?? "-"}</strong>
              </div>
            </div>
          </article>
          <article className="planning-card maintainers-card" id="mantenedores">
            <div className="detail-heading">
              <div>
                <p className="eyebrow">Mantenedores</p>
                <h2>Configuracion DTE / CAF</h2>
                <p className="compact-id">
                  Reglas locales de vencimiento y avisos, sin modificar documentos ni CAF origen
                </p>
              </div>
              <span className="badge alert-ok">Solo lectura</span>
            </div>

            {dteConfigState.status === "error" ? (
              <p className="status error">{dteConfigState.error}</p>
            ) : null}
            {dteConfigState.status === "loading" ? (
              <LoadingIndicator label="Cargando configuracion local..." />
            ) : null}

            <div className="table-wrap compact-table">
              <table>
                <thead>
                  <tr>
                    <th>Tipo DTE</th>
                    <th>Vigencia</th>
                    <th>Warning</th>
                    <th>Vencimiento</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {dteConfigState.data.map((item) => (
                    <tr key={item.config_id}>
                      <td>
                        <strong>{documentTypeLabel(item.document_type, item.document_label)}</strong>
                      </td>
                      <td>
                        {item.vigencia_meses === null
                          ? "No aplica"
                          : `${item.vigencia_meses} meses`}
                      </td>
                      <td>{item.warning_dias} dias</td>
                      <td>
                        <span
                          className={`badge ${
                            item.aplica_vencimiento ? "alert-warning" : "alert-ok"
                          }`}
                        >
                          {item.aplica_vencimiento ? "Controlado" : "No aplica"}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${item.activo ? "alert-ok" : "alert-warning"}`}>
                          {item.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {dteConfigState.status !== "loading" && dteConfigState.data.length === 0 ? (
                <p className="status">Sin configuracion local registrada.</p>
              ) : null}
            </div>
          </article>
          <article className="planning-card" id="configuracion">
            <p className="eyebrow">Configuracion</p>
            <h2>Estado del sistema</h2>
            <p>
              Concentrara version, conexion, seguridad SQL y parametros operativos del helpdesk.
            </p>
          </article>
        </section>
      </main>
    </div>
  );
};

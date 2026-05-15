import { useEffect, useMemo, useState } from "react";
import {
  getCompanyControl,
  getDocumentsSummary,
  type CompanyControl,
  type CompanyControlAlert,
  type CompanyControlQuery,
  type DocumentsSummary
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

const formatDate = (value: string | null) => value ?? "-";
const formatNumber = (value: number) => value.toLocaleString("es-CL");

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

export const App = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [alert, setAlert] = useState<"" | CompanyControlAlert>("");
  const [selectedCompany, setSelectedCompany] = useState<CompanyControl | null>(null);
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

  useEffect(() => {
    const abortController = new AbortController();
    const query: CompanyControlQuery = {
      limit: 100,
      offset: 0,
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

  return (
    <main className="app-shell">
      <section className="toolbar" aria-label="Filtros principales">
        <div>
          <p className="eyebrow">C2C Soporte</p>
          <h1>Control certificado de empresas</h1>
        </div>
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

      <section className="metrics" aria-label="Resumen empresas">
        <div className="metric">
          <span>Empresas</span>
          <strong>{formatNumber(companySummary.total)}</strong>
        </div>
        <div className="metric">
          <span>Activas</span>
          <strong>{formatNumber(companySummary.active)}</strong>
        </div>
        <div className="metric warning">
          <span>Sin emision</span>
          <strong>{formatNumber(companySummary.withoutEmission)}</strong>
        </div>
        <div className="metric urgent">
          <span>Urgentes</span>
          <strong>{formatNumber(companySummary.urgent)}</strong>
        </div>
      </section>

      <section className="detail-panel" aria-label="Resumen documental">
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
          <div className="metric">
            <span>Total emitidos</span>
            <strong>{formatNumber(documentsState.data.totals.documents)}</strong>
          </div>
          <div className="metric">
            <span>Empresas con docs</span>
            <strong>{formatNumber(documentsState.data.totals.companies)}</strong>
          </div>
          <div className="metric">
            <span>Devices con docs</span>
            <strong>{formatNumber(documentsState.data.totals.devices)}</strong>
          </div>
          <div className="metric">
            <span>Tipos DTE</span>
            <strong>{formatNumber(documentsState.data.totals.documentTypes)}</strong>
          </div>
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
                  <span>Tipo {item.documentType}</span>
                  <strong>{formatNumber(item.documents)}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {companyState.status === "error" ? <p className="status error">{companyState.error}</p> : null}
      {companyState.status === "loading" ? (
        <LoadingIndicator label="Cargando datos certificados..." />
      ) : null}

      <section className="table-wrap" aria-label="Control empresas">
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
      </section>
    </main>
  );
};

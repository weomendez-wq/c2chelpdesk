import { useEffect, useMemo, useState } from "react";
import { MetricCard } from "../components/MetricCard";
import { PaginationBar } from "../components/PaginationBar";
import { TenantSelector } from "../components/TenantSelector";
import {
  getCompanyControl,
  getDeviceControl,
  getDocumentsSummary,
  getFoliosControl,
  type CompanyControl,
  type CompanyControlAlert,
  type CompanyControlQuery,
  type DeviceControl,
  type DocumentsSummary,
  type FoliosControl
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
  const [companyLimit, setCompanyLimit] = useState(25);
  const [companyOffset, setCompanyOffset] = useState(0);
  const [companyTotal, setCompanyTotal] = useState<number | undefined>();
  const [deviceLimit, setDeviceLimit] = useState(25);
  const [deviceOffset, setDeviceOffset] = useState(0);
  const [deviceTotal, setDeviceTotal] = useState<number | undefined>();
  const [foliosLimit, setFoliosLimit] = useState(100);
  const [foliosOffset, setFoliosOffset] = useState(0);
  const [foliosTotal, setFoliosTotal] = useState<number | undefined>();
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

  return (
    <main className="app-shell">
      <section className="toolbar" aria-label="Filtros principales">
        <div>
          <p className="eyebrow">C2C Soporte</p>
          <h1>Control certificado de empresas</h1>
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

      <section className="metrics" aria-label="Resumen empresas">
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
                  <span>Tipo {item.documentType}</span>
                  <strong>{formatNumber(item.documents)}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="detail-panel" aria-label="Control folios y CAF">
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
                  <td>{item.document_type}</td>
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

      <section className="detail-panel" aria-label="Control devices">
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
    </main>
  );
};

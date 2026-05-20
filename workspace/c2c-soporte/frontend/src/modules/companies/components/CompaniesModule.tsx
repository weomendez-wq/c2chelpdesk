import { MetricCard } from "../../../components/MetricCard";
import { PaginationBar } from "../../../components/PaginationBar";
import type { CompanyControl, CompanyControlAlert } from "../../../services/supportApi";

type CompaniesModuleState =
  | { status: "idle" | "loading"; data: CompanyControl[]; error: null }
  | { status: "success"; data: CompanyControl[]; error: null }
  | { status: "error"; data: CompanyControl[]; error: string };

type AlertOption = {
  label: string;
  value: "" | CompanyControlAlert;
};

type StatusOption = {
  label: string;
  value: string;
};

type CompaniesModuleProps = {
  alert: "" | CompanyControlAlert;
  alertOptions: AlertOption[];
  companyLimit: number;
  companyOffset: number;
  companyState: CompaniesModuleState;
  companyTotal?: number;
  formatDate: (value: string | null) => string;
  formatDays: (value: number | null) => string;
  formatNumber: (value: number) => string;
  moduleClassName: string;
  onAlertChange: (value: "" | CompanyControlAlert) => void;
  onCompanyLimitChange: (value: number) => void;
  onCompanyOffsetChange: (value: number) => void;
  onRetry: () => void;
  onSearchChange: (value: string) => void;
  onSelectCompany: (company: CompanyControl) => void;
  onStatusChange: (value: string) => void;
  search: string;
  selectedCompany: CompanyControl | null;
  status: string;
  statusOptions: StatusOption[];
};

const alertPriority: Record<CompanyControlAlert, number> = {
  URGENTE: 4,
  WARNING: 3,
  SIN_EMISION: 2,
  OK: 1
};

const alertLabel: Record<CompanyControlAlert, string> = {
  OK: "OK",
  SIN_EMISION: "Sin emision",
  URGENTE: "Urgente",
  WARNING: "Warning"
};

export const CompaniesModule = ({
  alert,
  alertOptions,
  companyLimit,
  companyOffset,
  companyState,
  companyTotal,
  formatDate,
  formatDays,
  formatNumber,
  moduleClassName,
  onAlertChange,
  onCompanyLimitChange,
  onCompanyOffsetChange,
  onRetry,
  onSearchChange,
  onSelectCompany,
  onStatusChange,
  search,
  selectedCompany,
  status,
  statusOptions
}: CompaniesModuleProps) => {
  const summary = companyState.data.reduce(
    (accumulator, item) => ({
      active: accumulator.active + (item.empresa_status === "active" ? 1 : 0),
      inactive: accumulator.inactive + (item.empresa_status !== "active" ? 1 : 0),
      totalDocuments: accumulator.totalDocuments + item.documentos_emitidos_2026,
      totalVisible: accumulator.totalVisible + 1,
      urgent: accumulator.urgent + (item.nivel_alerta_emision === "URGENTE" ? 1 : 0),
      warning:
        accumulator.warning +
        (item.nivel_alerta_emision === "WARNING" ||
        item.nivel_alerta_emision === "SIN_EMISION"
          ? 1
          : 0)
    }),
    { active: 0, inactive: 0, totalDocuments: 0, totalVisible: 0, urgent: 0, warning: 0 }
  );

  const selectedAlert = selectedCompany?.nivel_alerta_emision ?? null;
  const topRiskCompanies = [...companyState.data]
    .sort((left, right) => {
      const alertDiff =
        (alertPriority[right.nivel_alerta_emision] ?? 0) -
        (alertPriority[left.nivel_alerta_emision] ?? 0);

      if (alertDiff !== 0) {
        return alertDiff;
      }

      return (right.dias_sin_emitir ?? 0) - (left.dias_sin_emitir ?? 0);
    })
    .slice(0, 4);

  return (
    <section className={moduleClassName} id="empresas" aria-label="Modulo empresas">
      <div className="companies-layout">
        <div className="companies-main">
          <div className="enterprise-section-header">
            <div>
              <p className="eyebrow">Empresas</p>
              <h2>Control multi-tenant</h2>
              <p>
                Vista operacional por empresa, tenant y RUT para priorizar soporte sin
                mezclar informacion entre clientes.
              </p>
            </div>
            <button className="secondary-action" type="button" onClick={onRetry}>
              Actualizar
            </button>
          </div>

          <div className="company-kpi-grid">
            <MetricCard
              label="Empresas"
              value={formatNumber(companyTotal ?? summary.totalVisible)}
              helper={`${formatNumber(summary.totalVisible)} visibles`}
            />
            <MetricCard label="Activas" value={formatNumber(summary.active)} tone="success" />
            <MetricCard label="Warnings" value={formatNumber(summary.warning)} tone="warning" />
            <MetricCard label="Urgentes" value={formatNumber(summary.urgent)} tone="urgent" />
            <MetricCard
              label="Docs visibles"
              value={formatNumber(summary.totalDocuments)}
              helper="Documentos 2026"
              tone="info"
            />
          </div>

          <div className="company-toolbar">
            <label className="field search-field">
              <span>Buscar</span>
              <input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Empresa, RUT o tenant"
              />
            </label>
            <label className="field">
              <span>Estado</span>
              <select value={status} onChange={(event) => onStatusChange(event.target.value)}>
                {statusOptions.map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Alerta</span>
              <select
                value={alert}
                onChange={(event) => onAlertChange(event.target.value as "" | CompanyControlAlert)}
              >
                {alertOptions.map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {companyState.status === "error" ? (
            <div className="status error action-status">
              <span>{companyState.error}</span>
              <button type="button" onClick={onRetry}>
                Reintentar
              </button>
            </div>
          ) : null}

          <div className="enterprise-table-shell">
            <div className="table-status-bar">
              <span>
                {companyState.status === "loading" ? "Cargando empresas..." : "Empresas cargadas"}
              </span>
              <strong>{formatNumber(companyState.data.length)} visibles</strong>
            </div>

            <table className="companies-table">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Tenant</th>
                  <th>RUT</th>
                  <th>Estado</th>
                  <th>Alerta</th>
                  <th>Docs 2026</th>
                  <th>Ultima emision</th>
                  <th>Dias sin emitir</th>
                  <th>Ubicacion</th>
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
                      onClick={() => onSelectCompany(item)}
                    >
                      <td>
                        <strong className="table-title">{item.empresa_name ?? "Sin nombre"}</strong>
                        <span className="table-subtitle">{item.giro ?? "Sin giro informado"}</span>
                      </td>
                      <td>
                        <span className="tenant-chip">{item.tenant_id.slice(0, 8)}</span>
                      </td>
                      <td>{item.rut ?? "-"}</td>
                      <td>
                        <span className={`badge ${item.empresa_status ?? ""}`}>
                          {item.empresa_status ?? "-"}
                        </span>
                      </td>
                      <td>
                        <span className={`badge alert-${item.nivel_alerta_emision.toLowerCase()}`}>
                          {alertLabel[item.nivel_alerta_emision]}
                        </span>
                      </td>
                      <td>{formatNumber(item.documentos_emitidos_2026)}</td>
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
              onLimitChange={onCompanyLimitChange}
              onOffsetChange={onCompanyOffsetChange}
            />
          </div>
        </div>

        <aside className="company-side-panel" aria-label="Detalle empresa seleccionada">
          <div className="side-panel-card">
            <p className="eyebrow">Seleccion actual</p>
            <h3>{selectedCompany?.empresa_name ?? "Vista global"}</h3>
            <p>
              {selectedCompany
                ? `RUT ${selectedCompany.rut ?? "-"} | Tenant ${selectedCompany.tenant_id}`
                : "Selecciona una empresa para acotar documentos, cajeros, folios y alertas."}
            </p>
            {selectedAlert ? (
              <span className={`badge alert-${selectedAlert.toLowerCase()}`}>
                {alertLabel[selectedAlert]}
              </span>
            ) : null}
          </div>

          <div className="side-panel-card">
            <p className="eyebrow">Riesgo visible</p>
            <div className="risk-list">
              {topRiskCompanies.map((company) => (
                <button
                  className="risk-item"
                  key={`${company.tenant_id}-${company.rut}`}
                  type="button"
                  onClick={() => onSelectCompany(company)}
                >
                  <span>
                    <strong>{company.empresa_name ?? "Sin nombre"}</strong>
                    <small>
                      {company.rut ?? "-"} | {formatDays(company.dias_sin_emitir)}
                    </small>
                  </span>
                  <span className={`badge alert-${company.nivel_alerta_emision.toLowerCase()}`}>
                    {alertLabel[company.nivel_alerta_emision]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="side-panel-card">
            <p className="eyebrow">Controles CRUD</p>
            <div className="crud-action-stack">
              <button type="button" disabled>
                Nueva empresa
              </button>
              <button type="button" disabled={!selectedCompany}>
                Editar seleccion
              </button>
              <button type="button" disabled={!selectedCompany}>
                Ver auditoria
              </button>
            </div>
            <p className="side-note">
              Acciones reservadas para la siguiente etapa; esta vista queda preparada para
              operar por tenant.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
};

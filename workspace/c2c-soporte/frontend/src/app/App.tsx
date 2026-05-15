import { useEffect, useMemo, useState } from "react";
import {
  getCompanyControl,
  type CompanyControl,
  type CompanyControlAlert,
  type CompanyControlQuery
} from "../services/supportApi";

type LoadState =
  | { status: "idle" | "loading"; data: CompanyControl[]; error: null }
  | { status: "success"; data: CompanyControl[]; error: null }
  | { status: "error"; data: CompanyControl[]; error: string };

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

const formatDays = (value: number | null) => {
  if (value === null) {
    return "-";
  }

  return `${value} dias`;
};

export const App = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [alert, setAlert] = useState<"" | CompanyControlAlert>("");
  const [state, setState] = useState<LoadState>({
    status: "idle",
    data: [],
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

    setState((current) => ({
      status: "loading",
      data: current.data,
      error: null
    }));

    getCompanyControl(query, abortController.signal)
      .then((response) => {
        setState({
          status: "success",
          data: response.items,
          error: null
        });
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) {
          return;
        }

        setState({
          status: "error",
          data: [],
          error: error instanceof Error ? error.message : "No se pudo cargar la informacion"
        });
      });

    return () => abortController.abort();
  }, [alert, search, status]);

  const summary = useMemo(() => {
    const total = state.data.length;
    const active = state.data.filter((item) => item.empresa_status === "active").length;
    const withoutEmission = state.data.filter(
      (item) => item.nivel_alerta_emision === "SIN_EMISION"
    ).length;
    const urgent = state.data.filter((item) => item.nivel_alerta_emision === "URGENTE").length;
    const emitted = state.data.reduce((totalDocs, item) => totalDocs + item.documentos_emitidos_2026, 0);

    return {
      active,
      emitted,
      total,
      urgent,
      withoutEmission
    };
  }, [state.data]);

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

      <section className="metrics" aria-label="Resumen certificado">
        <div className="metric">
          <span>Empresas</span>
          <strong>{summary.total}</strong>
        </div>
        <div className="metric">
          <span>Activas</span>
          <strong>{summary.active}</strong>
        </div>
        <div className="metric warning">
          <span>Sin emision</span>
          <strong>{summary.withoutEmission}</strong>
        </div>
        <div className="metric urgent">
          <span>Urgentes</span>
          <strong>{summary.urgent}</strong>
        </div>
        <div className="metric">
          <span>Docs 2026</span>
          <strong>{summary.emitted.toLocaleString("es-CL")}</strong>
        </div>
      </section>

      {state.status === "error" ? <p className="status error">{state.error}</p> : null}
      {state.status === "loading" ? <p className="status">Cargando datos certificados...</p> : null}

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
            {state.data.map((item) => (
              <tr key={`${item.tenant_id}-${item.rut}`}>
                <td>
                  <strong className="table-title">{item.empresa_name}</strong>
                  <span className="table-subtitle">{item.tenant_name ?? "Sin tenant"}</span>
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
                <td>{item.documentos_emitidos_2026.toLocaleString("es-CL")}</td>
                <td>{formatDate(item.primera_emision)}</td>
                <td>{formatDate(item.ultima_emision)}</td>
                <td>{formatDays(item.dias_sin_emitir)}</td>
                <td>{item.comuna ?? item.ciudad ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {state.status === "success" && state.data.length === 0 ? (
          <p className="empty">No hay empresas para los filtros seleccionados.</p>
        ) : null}
      </section>
    </main>
  );
};

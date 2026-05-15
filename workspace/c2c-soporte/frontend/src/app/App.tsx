import { useEffect, useMemo, useState } from "react";
import {
  getCompanyDevices,
  type CompanyDevice,
  type CompanyDevicesQuery
} from "../services/supportApi";

type LoadState =
  | { status: "idle" | "loading"; data: CompanyDevice[]; error: null }
  | { status: "success"; data: CompanyDevice[]; error: null }
  | { status: "error"; data: CompanyDevice[]; error: string };

const statusOptions = [
  { value: "", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "disabled", label: "Deshabilitados" },
  { value: "suspended", label: "Suspendidos" }
];

export const App = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [state, setState] = useState<LoadState>({
    status: "idle",
    data: [],
    error: null
  });

  useEffect(() => {
    const abortController = new AbortController();
    const query: CompanyDevicesQuery = {
      limit: 100,
      offset: 0,
      search: search.trim() || undefined,
      status: status || undefined
    };

    setState((current) => ({
      status: "loading",
      data: current.data,
      error: null
    }));

    getCompanyDevices(query, abortController.signal)
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
  }, [search, status]);

  const summary = useMemo(() => {
    const companies = new Set(state.data.map((item) => item.rut).filter(Boolean));
    const devices = state.data.filter((item) => item.device_id);
    const activeDevices = devices.filter((item) => item.device_status === "active");

    return {
      companies: companies.size,
      devices: devices.length,
      activeDevices: activeDevices.length
    };
  }, [state.data]);

  return (
    <main className="app-shell">
      <section className="toolbar" aria-label="Filtros principales">
        <div>
          <p className="eyebrow">C2C Soporte</p>
          <h1>Empresas y dispositivos</h1>
        </div>
        <div className="filters">
          <label className="field">
            <span>Buscar</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Empresa, RUT, dispositivo"
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
        </div>
      </section>

      <section className="metrics" aria-label="Resumen">
        <div className="metric">
          <span>Empresas</span>
          <strong>{summary.companies}</strong>
        </div>
        <div className="metric">
          <span>Dispositivos</span>
          <strong>{summary.devices}</strong>
        </div>
        <div className="metric">
          <span>Activos</span>
          <strong>{summary.activeDevices}</strong>
        </div>
      </section>

      {state.status === "error" ? <p className="status error">{state.error}</p> : null}
      {state.status === "loading" ? <p className="status">Cargando datos...</p> : null}

      <section className="table-wrap" aria-label="Empresas y dispositivos">
        <table>
          <thead>
            <tr>
              <th>Empresa</th>
              <th>RUT</th>
              <th>Estado empresa</th>
              <th>Dispositivo</th>
              <th>Estado dispositivo</th>
              <th>Local</th>
              <th>Comuna</th>
              <th>AnyDesk</th>
            </tr>
          </thead>
          <tbody>
            {state.data.map((item, index) => (
              <tr key={`${item.tenant_id}-${item.rut}-${item.device_id ?? "sin-device"}-${index}`}>
                <td>{item.empresa_name}</td>
                <td>{item.rut}</td>
                <td>
                  <span className="badge">{item.empresa_status}</span>
                </td>
                <td>{item.device_name ?? item.device_id ?? "Sin dispositivo"}</td>
                <td>
                  {item.device_status ? (
                    <span className={`badge ${item.device_status}`}>{item.device_status}</span>
                  ) : (
                    "Sin estado"
                  )}
                </td>
                <td>{item.device_local ?? "-"}</td>
                <td>{item.device_comuna ?? item.empresa_comuna ?? "-"}</td>
                <td>{item.anydesk ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {state.status === "success" && state.data.length === 0 ? (
          <p className="empty">No hay resultados para los filtros seleccionados.</p>
        ) : null}
      </section>
    </main>
  );
};

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTenant } from "@/context/TenantContext";
import { useGlobalHealthContext } from "@/context/GlobalHealthContext";
import { useGlobalHealth } from "@/modules/admin/hooks/useGlobalHealth";
import FolioStatusCell from "@/modules/admin/components/FolioStatusCell";
import DeviceStatusCell from "@/modules/admin/components/DeviceStatusCell";
import { PaginationBar } from "@/shared/components/PaginationBar";
import { ActivityLineCell } from "@/modules/admin/components/ActivityLineCell";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Tooltip as ChartTooltip,
} from "recharts";
import {
  Zap,
  HardDrive,
  ShieldAlert,
  Building2,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  FilterX,
  User,
  LogOut,
  Search,
  LayoutDashboard,
  Calendar,
  PlusCircle,
} from "lucide-react"; // Verifica que sea 'lucide-react' en tu proyecto real
import { toast } from "sonner";

export const GlobalSupportDashboard = () => {
  const navigate = useNavigate();
  const { handleSelectTenant, activeTenant } = useTenant();
  const { empresas: listaListBox } = useGlobalHealthContext();

  // ESTADOS PRINCIPALES
  const [chartView, setChartView] = useState("docs");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState(""); // Nuevo estado para búsqueda por fecha
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: "total_documentos",
    direction: "desc",
  });

  const { empresas, totals, loading, refreshDatabase } = useGlobalHealth(
    activeTenant?.id,
    currentPage,
    pageSize,
  );

  // 1. LÓGICA DEL GRÁFICO TOP 10
  const chartData = useMemo(() => {
    if (!Array.isArray(empresas) || empresas.length === 0) return [];
    let base = [...empresas];
    const tresMesesAtras = new Date();
    tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);

    switch (chartView) {
      case "docs":
        base.sort(
          (a, b) => (b.total_documentos || 0) - (a.total_documentos || 0),
        );
        break;
      case "critical":
        base.sort(
          (a, b) =>
            (b.total_devices_inactivos || 0) - (a.total_devices_inactivos || 0),
        );
        break;
      case "devices":
        base.sort(
          (a, b) =>
            (Number(b.total_devices) || 0) - (Number(a.total_devices) || 0),
        );
        break;
      case "no_folios":
        base.sort(
          (a, b) =>
            (Number(a.total_folios_autorizados) || 0) -
            (Number(b.total_folios_autorizados) || 0),
        );
        break;
      case "newest":
        base = base.filter(
          (e) => new Date(e.empresa_created_at) >= tresMesesAtras,
        );
        base.sort(
          (a, b) =>
            new Date(b.empresa_created_at) - new Date(a.empresa_created_at),
        );
        break;
      default:
        break;
    }

    return base.slice(0, 10).map((e) => ({
      name: e.empresa_nombre?.substring(0, 10) + "..",
      fullName: e.empresa_nombre,
      value:
        chartView === "docs"
          ? Number(e.total_documentos || 0)
          : chartView === "devices"
            ? Number(e.total_devices || 0)
            : Number(e.total_documentos || 10),
    }));
  }, [empresas, chartView]);

  // 2. BÚSQUEDA Y FILTRADO LOCAL (Incluye Fecha)
  const displayData = useMemo(() => {
    if (!Array.isArray(empresas)) return [];
    return empresas.filter((e) => {
      const matchText =
        e.empresa_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.rut?.toString().includes(searchTerm);
      const matchDate = dateFilter
        ? e.empresa_created_at?.includes(dateFilter)
        : true;
      return matchText && matchDate;
    });
  }, [empresas, searchTerm, dateFilter]);

  const stats = useMemo(
    () => ({
      totalEmpresas: totals?.totalEmpresas || 0,
      totalDocs: totals?.totalDocs || 0,
      totalDevices: totals?.totalDevices || 0,
      totalCafs: totals?.totalCafs || 0,
      totalCriticos: totals?.totalCriticos || 0,
      totalPages: totals?.totalPages || 8,
    }),
    [totals],
  );

  return (
    <div className="flex min-h-screen font-sans bg-[#F1F5F9]">
      <main className="flex flex-col flex-1 min-w-0">
        {/* HEADER */}
        <header className="sticky top-0 z-50 flex flex-col md:flex-row items-center justify-between px-8 py-6 bg-white border-b shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] border-slate-200">
          <div className="flex items-center w-full gap-8 md:w-auto">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-slate-900 uppercase italic tracking-[0.2em]">
                  Torre de Control
                </span>
              </div>
              <h2 className="text-[11px] font-bold uppercase text-slate-400 mt-1 italic">
                Operaciones C2C
              </h2>
            </div>
            <div className="flex-1 w-full max-w-xl">
              <div className="relative flex items-center w-full p-1 border rounded-full bg-slate-100 border-slate-200">
                <div className="p-2 bg-white rounded-full text-slate-400">
                  <Building2 size={16} />
                </div>
                <select
                  className="flex-1 bg-transparent border-none py-2 px-4 text-[11px] font-black uppercase text-slate-700 outline-none appearance-none"
                  value={activeTenant?.id || ""}
                  onChange={(e) => {
                    setCurrentPage(1);
                    const emp = listaListBox.find(
                      (x) => x.tenant_id === e.target.value,
                    );
                    if (emp)
                      handleSelectTenant({
                        id: emp.tenant_id,
                        nombre: emp.empresa_nombre,
                        rut: emp.rut,
                      });
                    else handleSelectTenant(null);
                  }}
                >
                  <option value="">--- VISTA GLOBAL ---</option>
                  {listaListBox?.map((emp) => (
                    <option key={emp.tenant_id} value={emp.tenant_id}>
                      {emp.empresa_nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4 md:mt-0">
            {/* BÚSQUEDA POR FECHA */}
            <div className="relative flex items-center px-3 py-2 transition-all border border-transparent bg-slate-100 rounded-2xl focus-within:border-blue-200 focus-within:bg-white">
              <Calendar size={14} className="mr-2 text-slate-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent text-[10px] font-bold outline-none uppercase text-slate-600"
              />
            </div>
            <div className="relative hidden group lg:block">
              <Search
                className="absolute -translate-y-1/2 left-4 top-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder="BUSCAR..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 pr-6 py-3 w-48 bg-slate-100 rounded-2xl text-[10px] font-bold focus:bg-white outline-none border border-transparent focus:border-blue-200"
              />
            </div>
            <button
              onClick={() => refreshDatabase()}
              className="p-3 text-white transition-all rounded-full bg-slate-900 hover:bg-slate-800"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </header>

        {/* CONTENIDO CON BLOQUEO DE CLIC */}
        <div
          className={`p-8 space-y-8 transition-all duration-500 ${loading ? "pointer-events-none opacity-50 grayscale-[0.5]" : ""}`}
        >
          {/* STATS */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              title="Empresas"
              value={stats.totalEmpresas}
              icon={<Building2 size={20} />}
            />
            <StatCard
              title="Docs"
              value={stats.totalDocs}
              icon={<Zap size={20} />}
            />
            <StatCard
              title="Equipos"
              value={stats.totalDevices}
              icon={<HardDrive size={20} />}
            />
            {/* CARD DE FOLIOS MEJORADA */}
            <StatCard
              title="Disponibilidad Folios (CAF)"
              value={stats.totalCafs}
              icon={<ShieldAlert size={20} />}
              isAlert={stats.totalCriticos > 0}
              onIconClick={() => navigate("/caf")} // <--- Ruta a la gestión de folios
            />

            <StatCard
              title="Alertas Críticas"
              value={stats.totalCriticos}
              icon={<AlertCircle size={20} />}
              isAlert={stats.totalCriticos > 0}
            />
          </div>

          {/* RANKING CHART */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl p-8">
            <div className="flex flex-col items-center justify-between gap-4 mb-8 md:flex-row">
              <h3 className="flex items-center gap-2 text-sm italic font-black uppercase text-slate-900">
                <LayoutDashboard size={18} className="text-blue-600" /> Ranking
                Operativo
              </h3>
              <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                <MetricBtn
                  active={chartView === "docs"}
                  onClick={() => setChartView("docs")}
                  label="Emisión"
                  icon={<Zap size={12} />}
                  color="blue"
                />
                <MetricBtn
                  active={chartView === "critical"}
                  onClick={() => setChartView("critical")}
                  label="Alertas"
                  icon={<AlertCircle size={12} />}
                  color="red"
                />
                <MetricBtn
                  active={chartView === "devices"}
                  onClick={() => setChartView("devices")}
                  label="Equipos"
                  icon={<HardDrive size={12} />}
                  color="emerald"
                />
                <MetricBtn
                  active={chartView === "no_folios"}
                  onClick={() => setChartView("no_folios")}
                  label="Folios"
                  icon={<ShieldAlert size={12} />}
                  color="amber"
                />
                <MetricBtn
                  active={chartView === "newest"}
                  onClick={() => setChartView("newest")}
                  label="Nuevas"
                  icon={<Calendar size={12} />}
                  color="indigo"
                />
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: "bold" }}
                  />
                  <YAxis hide />
                  <ChartTooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[10, 10, 10, 10]} barSize={45}>
                    {chartData.map((e, i) => (
                      <Cell
                        key={i}
                        fill={chartView === "critical" ? "#ef4444" : "#2563eb"}
                        fillOpacity={1 - i * 0.05}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* TABLA PRINCIPAL */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="text-blue-400 bg-slate-900">
                <tr>
                  <SortHeader
                    label="Identificación"
                    k="empresa_nombre"
                    conf={sortConfig}
                    onClick={setSortConfig}
                  />
                  <th className="p-6 text-center text-[10px] font-black uppercase text-emerald-400 tracking-widest">
                    Estado Equipos
                  </th>
                  <th className="p-6 text-center text-[10px] font-black uppercase text-amber-400 tracking-widest">
                    Estado Folios
                  </th>
                  <SortHeader
                    label="Actividad 30D"
                    k="total_documentos"
                    conf={sortConfig}
                    center
                  />
                  <th className="p-6 text-center text-[10px] font-black uppercase text-slate-500">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayData.map((emp, index) => (
                  <tr
                    key={emp.tenant_id}
                    className={`transition-all hover:bg-blue-50/40 ${index % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
                  >
                    <td className="p-6">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-black uppercase text-slate-800 leading-tight">
                          {emp.empresa_nombre}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-bold text-slate-400">
                            RUT {emp.rut}
                          </span>
                          <span className="text-[8px] font-mono text-blue-300">
                            UID {emp.tenant_id?.substring(0, 8)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <DeviceStatusCell
                        total={emp.total_devices}
                        inactivos={emp.total_devices_inactivos}
                      />
                    </td>
                    <td className="p-6 text-center">
                      <FolioStatusCell
                        tieneCriticos={
                          Number(emp.total_folios_autorizados) === 0
                        }
                        stockTotal={emp.total_folios_autorizados}
                      />
                    </td>
                    <td className="p-6">
                      <ActivityLineCell
                        total={emp.total_documentos}
                        history={emp.activity_history}
                      />
                    </td>
                    <td className="p-6 text-center">
                      <button
                        onClick={() => {
                          handleSelectTenant({
                            id: emp.tenant_id,
                            nombre: emp.empresa_nombre,
                            rut: emp.rut,
                          });
                          navigate("/health");
                        }}
                        className="p-3 transition-all bg-white border shadow-sm border-slate-200 text-slate-400 rounded-2xl hover:text-blue-600 active:scale-90"
                      >
                        <ArrowRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between p-8 border-t bg-slate-50/80">
              <PaginationBar
                page={currentPage}
                totalPages={stats.totalPages}
                pageSize={pageSize}
                setPageSize={(v) => {
                  setPageSize(v);
                  setCurrentPage(1);
                }}
                onNext={() => setCurrentPage((p) => p + 1)}
                onPrev={() => setCurrentPage((p) => p - 1)}
                total={stats.totalEmpresas}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// COMPONENTES AUXILIARES DE SOPORTE
const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.[0])
    return (
      <div className="p-4 text-white border shadow-2xl bg-slate-900 rounded-xl border-slate-700">
        <p className="text-[10px] font-black uppercase mb-1">
          {payload[0].payload.fullName}
        </p>
        <p className="text-lg font-bold text-blue-400">{payload[0].value}</p>
      </div>
    );
  return null;
};

const StatCard = ({ title, value, icon, isAlert, onIconClick }) => (
  <div
    className={`p-6 bg-white border rounded-[2.5rem] shadow-sm transition-all ${isAlert ? "border-red-200 bg-red-50/40 animate-pulse" : "border-slate-200"}`}
  >
    <div className="flex justify-between mb-4">
      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
        {title}
      </p>
      {/* El icono ahora tiene un botón invisible para la acción */}
      <button
        onClick={onIconClick}
        className={`p-2.5 rounded-xl transition-all active:scale-90 ${
          isAlert
            ? "bg-red-100 text-red-600"
            : "bg-slate-50 text-slate-500 hover:bg-blue-600 hover:text-white"
        } ${onIconClick ? "cursor-pointer" : "cursor-default"}`}
      >
        {icon}
      </button>
    </div>
    <h2 className="text-2xl italic font-black tracking-tighter text-slate-900">
      {value || "0"}
    </h2>
  </div>
);

const MetricBtn = ({ active, onClick, label, icon, color }) => {
  const colors = {
    blue: "bg-blue-600",
    red: "bg-red-600",
    emerald: "bg-emerald-600",
    amber: "bg-amber-500",
    indigo: "bg-indigo-600",
  };
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${active ? colors[color] + " text-white shadow-lg scale-105" : "text-slate-500 hover:bg-white"}`}
    >
      {icon}
      {label}
    </button>
  );
};

const SortHeader = ({
  label,
  k,
  conf,
  onClick,
  center,
  color = "text-blue-400",
}) => (
  <th
    className={`p-6 cursor-pointer hover:bg-slate-800 transition-colors ${center ? "text-center" : ""}`}
    onClick={() =>
      onClick({
        key: k,
        direction: conf.key === k && conf.direction === "desc" ? "asc" : "desc",
      })
    }
  >
    <div
      className={`flex items-center gap-2 ${center ? "justify-center" : ""}`}
    >
      <span
        className={`text-[10px] font-black uppercase tracking-widest ${color}`}
      >
        {label}
      </span>
      {conf.key === k &&
        (conf.direction === "asc" ? (
          <ChevronUp size={14} className="text-white" />
        ) : (
          <ChevronDown size={14} className="text-white" />
        ))}
    </div>
  </th>
);

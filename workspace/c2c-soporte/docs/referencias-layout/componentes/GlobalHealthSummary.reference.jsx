import React from "react";
import { 
  Building2, 
  Monitor, 
  FileText, 
  ArrowUpRight, 
  Activity 
} from "lucide-react";

const GlobalHealthSummary = ({ stats }) => {
  if (!stats) return null;

  // Calculamos porcentajes de conectividad para las barras de progreso
  const pctEmpresas = Math.round((stats.empresas_hoy / stats.total_empresas) * 100) || 0;
  const pctDevices = Math.round((stats.devices_hoy / stats.total_devices) * 100) || 0;

  return (
    <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
      
      {/* KPI: EMPRESAS CONECTADAS */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 text-blue-600 bg-blue-50 rounded-2xl">
            <Building2 size={20} />
          </div>
          <span className="flex items-center text-[10px] font-black text-emerald-500 uppercase italic">
            <ArrowUpRight size={12} /> {stats.empresas_mes} este mes
          </span>
        </div>
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresas Online Hoy</h3>
        <p className="my-1 text-3xl italic font-black text-slate-800">
          {stats.empresas_hoy} <span className="text-sm font-normal text-slate-300">/ {stats.total_empresas}</span>
        </p>
        <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
          <div 
            className="h-full transition-all duration-1000 bg-blue-600" 
            style={{ width: `${pctEmpresas}%` }}
          />
        </div>
        <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase italic">
          {pctEmpresas}% de la flota operativa
        </p>
      </div>

      {/* KPI: DISPOSITIVOS ACTIVOS */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Monitor size={20} />
          </div>
          <div className="flex gap-1">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
        </div>
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dispositivos Activos</h3>
        <p className="my-1 text-3xl italic font-black text-slate-800">
          {stats.devices_hoy} <span className="text-sm font-normal text-slate-300">/ {stats.total_devices}</span>
        </p>
        <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
          <div 
            className="h-full transition-all duration-1000 bg-emerald-500" 
            style={{ width: `${pctDevices}%` }}
          />
        </div>
        <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase italic">
          {stats.devices_mes} conectados en los últimos 30 días
        </p>
      </div>

      {/* KPI: VOLUMEN DE DOCUMENTOS */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 text-purple-600 bg-purple-50 rounded-2xl">
            <FileText size={20} />
          </div>
        </div>
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Documentos Hoy</h3>
        <p className="my-1 text-3xl italic font-black text-slate-800">
          {Number(stats.docs_hoy).toLocaleString()}
        </p>
        <div className="flex items-center gap-2 mt-4 text-[9px] font-bold text-slate-500 uppercase">
          <Activity size={12} className="text-purple-400" />
          <span>Total histórico: {Number(stats.docs_total_historico).toLocaleString()}</span>
        </div>
      </div>

      {/* KPI: ALCANCE TRIMESTRAL */}
      <div className="p-6 rounded-[2.5rem] border border-slate-800 bg-slate-900 text-white shadow-xl shadow-slate-200">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 text-blue-400 border bg-slate-800 rounded-2xl border-slate-700">
            <Building2 size={20} />
          </div>
        </div>
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alcance 3 Meses</h3>
        <p className="my-1 text-3xl italic font-black text-white">
          {stats.empresas_3meses} <span className="text-sm font-normal text-slate-600">/ {stats.total_empresas}</span>
        </p>
        <p className="text-[9px] font-bold text-blue-400 mt-4 uppercase italic leading-tight">
          Empresas que han reportado <br /> actividad en el último trimestre
        </p>
      </div>

    </div>
  );
};

export default GlobalHealthSummary;
import React, { useState, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { useTenant } from "@/context/TenantContext";
import { createContext, useContext } from "react";
import { useGlobalHealthContext } from "@/context/GlobalHealthContext";
import {
  LayoutDashboard,
  Activity,
  Files, // Para documentos
  HardDrive,
  ChevronRight,
  ChevronLeft,
  Monitor,
  Building2,
  X,
  User,
  Phone,
  Mail,
} from "lucide-react";

const Sidebar = () => {
  const { empresas } = useGlobalHealthContext();
  const { activeTenant } = useTenant();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showContactCard, setShowContactCard] = useState(false);
  // 1. Lógica de Alertas Críticas Segura
  // En Sidebar.jsx (Línea 20 aprox)
  // const { dashboard } = useGlobalHealthContext();
  //const empresas = dashboard?.empresas || []; // Extraemos empresas del objeto dashboard
  const criticalCount = useMemo(() => {
    // Si empresas no es un array, devolvemos 0 inmediatamente
    if (!Array.isArray(empresas)) return 0;
    return empresas.filter(
      (e) => Number(e.total_caf) < 100 && Number(e.total_caf) > 0,
    ).length;
  }, [empresas]);

  // 2. Estructura de Menú (Se quitó el filtrado de empresas aquí para evitar errores)
  const menuGroups = [
    {
      label: "Administración",
      items: [
        {
          name: "Torre de Control",
          path: "/",
          icon: <LayoutDashboard size={18} />,
        },
      ],
    },
    {
      label: "Monitor de Salud",
      items: [
        { name: "Salud 360°", path: "/health", icon: <Activity size={18} /> },
        { name: "Estado CAF / Folios", path: "/caf", icon: <Files size={18} /> },
        {
          name: "Dispositivos",
          path: "/devices",
          icon: <HardDrive size={18} />,
        },
        {
          name: "Documentos", // <--- NUEVO ITEM
          path: "/documentos",
          icon: <Files size={18} />,
        },
        {
          name: "Empresas",
          path: "/empresas",
          icon: <Building2 size={18} />,
        },
      ],
    },
  ];

  return (
    <aside
      className={`relative flex flex-col h-screen border-r bg-slate-900 border-white/5 transition-all duration-300 shadow-2xl z-50 ${
        isCollapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Botón para Colapsar */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute z-50 p-1 text-white transition-colors bg-blue-600 border-2 rounded-full shadow-lg -right-3 top-10 border-slate-900 hover:bg-blue-500"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
      {/* Header del Logo */}
      <div className={`p-8 mb-4 ${isCollapsed ? "px-6 text-center" : ""}`}>
        {isCollapsed ? (
          <div className="inline-flex items-center justify-center w-8 h-8 text-sm italic font-black text-white bg-blue-600 rounded-lg">
            C2C
          </div>
        ) : (
          <h2 className="text-2xl italic font-black tracking-tighter text-white uppercase">
            C2C <span className="text-blue-500">Support</span>
          </h2>
        )}
      </div>
      {/* Mapeo del menú (Asegúrate de que NavLink use la lógica de isActive que ya tienes) */}
      <nav className="flex-1 px-4 space-y-8 overflow-x-hidden overflow-y-auto custom-scrollbar">
        {menuGroups.map((group, idx) => (
          <div key={idx}>
            {!isCollapsed && (
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 px-2 italic">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `
                    relative flex items-center ${isCollapsed ? "justify-center" : "justify-between"} 
                    px-4 py-3.5 rounded-2xl text-[11px] font-bold uppercase italic transition-all
                    ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50 scale-[1.02]"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className={isCollapsed ? "scale-110" : ""}>
                      {item.icon}
                    </span>
                    {!isCollapsed && <span>{item.name}</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronRight size={14} className="opacity-30" />
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      {/* Identificador de Tenant Activo (Pie del Sidebar) */}
      {/* <div
        className={`p-5 m-4 border transition-all duration-300 ${
          isCollapsed
            ? "bg-blue-600/10 border-blue-500/20 rounded-2xl"
            : "bg-black/20 border-white/5 rounded-3xl"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 text-blue-400 bg-slate-800 rounded-xl shrink-0">
            <Building2 size={16} />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-[8px] font-black uppercase text-slate-500 mb-0.5 italic">
                Empresa en Gestión
              </p>
              <p className="text-[10px] font-bold text-blue-400 truncate uppercase italic leading-tight">
                {activeTenant?.nombre || "Global / Sin Selección"}
              </p>
            </div>
          )}
        </div>
      </div>
 */}
      {/* Footer - Sección de Contacto Unificada */}
      {/* Footer - Información de Contacto Esencial */}
      <div className="relative p-6 mt-auto border-t border-white/5">
        {/* 1. LOS ICONOS (Siempre visibles o contraídos) */}
        <div
          className={`flex items-center gap-4 ${isCollapsed ? "flex-col" : "justify-around"}`}
        >
          <button
            onClick={() => setShowContactCard(!showContactCard)}
            className="p-2 transition-all text-slate-500 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl group"
            title="Contacto Soporte"
          >
            <User
              size={18}
              className="transition-transform group-hover:scale-110"
            />
          </button>

          {!isCollapsed && (
            <>
              <a
                href="tel:+56956593213"
                className="p-2 transition-all text-slate-500 hover:text-emerald-500"
              >
                <Phone size={18} />
              </a>
              <a
                href="mailto:soportedte@c2c.cl"
                className="p-2 transition-all text-slate-500 hover:text-blue-400"
              >
                <Mail size={18} />
              </a>
            </>
          )}
        </div>

        {/* 2. LA "CARTITA" (Modal Flotante / Popover) */}
        {showContactCard && (
          <div className="absolute w-64 p-6 duration-300 border shadow-2xl bottom-20 left-6 bg-slate-900 border-white/10 rounded-4xl animate-in fade-in zoom-in z-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-black italic uppercase text-blue-500">
                  Rodrigo A. Rodriguez
                </p>
                <p className="text-[7px] font-bold text-slate-500 uppercase">
                  Soporte Especializado DTE
                </p>
              </div>
              <button
                onClick={() => setShowContactCard(false)}
                className="text-slate-600 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 text-blue-400 rounded-lg bg-white/5">
                  <Mail size={12} />
                </div>
                <a
                  href="mailto:soportedte@c2c.cl"
                  className="text-[9px] font-mono text-slate-300 hover:text-white"
                >
                  soportedte@c2c.cl
                </a>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5 text-emerald-400">
                  <Phone size={12} />
                </div>
                <p className="text-[10px] font-mono font-black text-emerald-500 tracking-tighter">
                  +56 9 5659 3213
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

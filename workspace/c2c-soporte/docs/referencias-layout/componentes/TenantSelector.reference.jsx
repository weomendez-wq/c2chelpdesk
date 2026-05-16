import React, { useState, useRef, useEffect, useMemo } from "react";
import { Building2, ChevronDown, Search, Check, X } from "lucide-react";
import { useEmpresa } from "@/context/EmpresaContext";
import { useTheme } from "@/context/ThemeContext";

export const TenantSelector = () => {
  const { empresas, selectedEmpresa, selectEmpresa, loading } = useEmpresa();
  const { activeTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    if (!Array.isArray(empresas)) return [];
    const term = search.toLowerCase().trim();
    if (!term) return empresas;
    return empresas.filter((e) => {
      const nombre = String(e.nombre || "").toLowerCase();
      const rut = String(e.rut || "");
      const id = String(e.value || "");
      return nombre.includes(term) || rut.includes(term) || id.includes(term);
    });
  }, [empresas, search]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className={`group flex w-full min-w-0 items-center gap-3 rounded-2xl border p-2 pr-4 shadow-sm transition-all ${
          selectedEmpresa ? activeTheme.accentSoftClass : "bg-white border-slate-200 hover:bg-slate-50"
        }`}
      >
        <div
          className={`shrink-0 rounded-xl p-2.5 transition-transform group-hover:scale-105 ${
            selectedEmpresa ? activeTheme.accentSolidClass : "bg-slate-900 text-white"
          }`}
        >
          <Building2 size={20} />
        </div>

        <div className="min-w-0 flex-1 border-r border-slate-200 pr-3 text-left">
          <p className="mb-1 text-[8px] font-black uppercase italic leading-none text-slate-500">
            Empresa en Gestión
          </p>
          <p className={`truncate text-[11px] font-black uppercase italic md:text-[12px] ${selectedEmpresa ? activeTheme.accentClass : "text-slate-800"}`}>
            {loading ? "Cargando..." : selectedEmpresa?.nombre || "Global / Vista General"}
          </p>
        </div>

        {selectedEmpresa && (
          <div className="mr-1 hidden min-w-0 max-w-[7.5rem] flex-col text-left 2xl:flex">
            <span className={`text-[9px] font-mono font-bold leading-none ${activeTheme.accentClass}`}>
              RUT: {selectedEmpresa.rut}
            </span>
            <span className="mt-1 truncate text-[9px] font-mono font-black leading-none text-slate-600">
              ID: {selectedEmpresa.value}
            </span>
          </div>
        )}

        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-3 w-80 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl duration-200 animate-in fade-in slide-in-from-top-2">
          <div className="border-b border-slate-100 bg-slate-50/50 p-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                size={16}
              />
              <input
                autoFocus
                type="text"
                placeholder="Buscar por nombre, RUT o ID..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-[11px] font-bold outline-none transition-all focus:ring-4"
                style={{ boxShadow: "0 0 0 0 color-mix(in srgb, var(--c2c-primary) 18%, transparent)" }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="border-b border-slate-100 bg-slate-50/30 px-4 py-1.5">
            <p className="text-[9px] font-black uppercase italic text-slate-600">
              {search.trim()
                ? `${filtered.length} resultado${filtered.length !== 1 ? "s" : ""} de ${empresas.length}`
                : `${empresas.length} empresa${empresas.length !== 1 ? "s" : ""} disponibles`}
            </p>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((emp) => (
                <button
                  key={emp.value}
                  onClick={() => {
                    selectEmpresa(emp);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`flex w-full items-center justify-between border-b border-slate-50 p-4 transition-colors last:border-none ${
                    selectedEmpresa?.value === emp.value
                      ? "bg-slate-100/80"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase italic leading-tight text-slate-800">
                      {emp.nombre}
                    </p>
                    <div className="mt-1 flex gap-2">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[8px] font-mono font-black text-slate-700">
                        RUT: {emp.rut}
                      </span>
                      <span className={`rounded px-1.5 py-0.5 text-[8px] font-mono font-bold ${activeTheme.accentSoftClass}`}>
                        ID: {emp.value}
                      </span>
                    </div>
                  </div>
                  {selectedEmpresa?.value === emp.value && (
                    <Check size={16} className="c2c-theme-accent" />
                  )}
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-[10px] font-black uppercase italic text-slate-600">
                Sin resultados
              </div>
            )}
          </div>

          <button
            onClick={() => {
              selectEmpresa(null);
              setIsOpen(false);
              setSearch("");
            }}
            className={`flex w-full items-center justify-center gap-2 p-4 text-[10px] font-black uppercase italic transition-all ${activeTheme.accentSolidClass}`}
          >
            <X size={14} /> Restaurar Vista Global
          </button>
        </div>
      )}
    </div>
  );
};

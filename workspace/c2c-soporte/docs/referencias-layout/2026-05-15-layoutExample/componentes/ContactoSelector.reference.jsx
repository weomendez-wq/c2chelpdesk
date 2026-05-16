// src/shared/components/ContactoSelector.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  User, ChevronDown, Search, Check, X,
  Loader2, Plus, Phone, Mail, Briefcase,
} from "lucide-react";
import { soporteApi } from "@/api/modules/soporte.api";
import toast from "react-hot-toast";

/**
 * Selector de contacto filtrado por cliente.
 * Props:
 *  - value        : objeto contacto seleccionado o null
 *  - onChange     : (contacto | null) => void
 *  - rutCliente   : string — filtra contactos de este RUT
 *  - nombreCliente: string — se usa al crear contacto nuevo
 *  - label        : string
 *  - emptyLabel   : string
 *  - disabled     : bool — cuando no hay cliente seleccionado
 */
export function ContactoSelector({
  value,
  onChange,
  rutCliente,
  nombreCliente = "",
  label = "Contacto del cliente",
  emptyLabel = "Seleccionar contacto",
  disabled = false,
}) {
  const [isOpen, setIsOpen]         = useState(false);
  const [search, setSearch]         = useState("");
  const [options, setOptions]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [vistaCrear, setVistaCrear] = useState(false);
  const [creando, setCreando]       = useState(false);
  const [nuevoForm, setNuevoForm]   = useState({ nombre: "", email: "", fono1: "", cargo: "" });
  const [nuevoErrors, setNuevoErrors] = useState({});
  const dropdownRef = useRef(null);

  // Cierra al hacer click fuera
  useEffect(() => {
    const handleOut = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setVistaCrear(false);
      }
    };
    document.addEventListener("mousedown", handleOut);
    return () => document.removeEventListener("mousedown", handleOut);
  }, []);

  // Reset estado interno cuando cambia el cliente
  useEffect(() => {
    setOptions([]);
    setSearch("");
    setVistaCrear(false);
  }, [rutCliente]);

  // Carga de contactos al abrir o cambiar búsqueda
  useEffect(() => {
    if (!isOpen || !rutCliente) return;
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await soporteApi.getContactos({ rut_cliente: rutCliente, search, limit: 30 });
        const data = res.data?.data ?? res.data ?? [];
        setOptions(Array.isArray(data) ? data : []);
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [search, isOpen, rutCliente]);

  const setNuevo = (k, v) => setNuevoForm((prev) => ({ ...prev, [k]: v }));

  const abrirCrear = () => {
    setNuevoForm({ nombre: "", email: "", fono1: "", cargo: "" });
    setNuevoErrors({});
    setVistaCrear(true);
  };

  const handleCrear = async () => {
    const errs = {};
    if (!nuevoForm.nombre.trim()) errs.nombre = "El nombre es obligatorio";
    setNuevoErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setCreando(true);
    try {
      const body = {
        nombre:         nuevoForm.nombre.trim(),
        email:          nuevoForm.email.trim()  || undefined,
        fono1:          nuevoForm.fono1.trim()  || undefined,
        cargo:          nuevoForm.cargo.trim()  || undefined,
        rut_cliente:    rutCliente,
        nombre_cliente: nombreCliente,
        estado:         true,
      };
      const res    = await soporteApi.createContacto(body);
      const nuevo  = res.data?.data ?? res.data;
      toast.success("Contacto creado correctamente");
      onChange(nuevo);
      setIsOpen(false);
      setVistaCrear(false);
    } catch (err) {
      toast.error(err.response?.data?.error?.message ?? "No se pudo crear el contacto");
    } finally {
      setCreando(false);
    }
  };

  // ── Render trigger ─────────────────────────────────────────────────────────

  const isDisabled = disabled || !rutCliente;

  return (
    <div
      className={`relative w-full ${isDisabled ? "opacity-50 pointer-events-none" : ""}`}
      ref={dropdownRef}
    >
      {/* Botón principal */}
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className={`flex items-center gap-3 w-full p-2 pr-4 rounded-2xl border shadow-sm transition-all group
          ${value
            ? "bg-emerald-50 border-emerald-200 hover:bg-emerald-100/50"
            : "bg-white border-slate-200 hover:bg-slate-50"
          }`}
      >
        {/* Ícono */}
        <div className={`p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-105
          ${value ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}
        >
          <User size={16} />
        </div>

        {/* Texto */}
        <div className="flex-1 min-w-0 text-left">
          <p className="text-[8px] font-black uppercase italic text-slate-400 leading-none mb-1">
            {label}
          </p>
          <p className={`text-[12px] font-black uppercase italic truncate
            ${value ? "text-emerald-700" : "text-slate-500"}`}
          >
            {value?.nombre || emptyLabel}
          </p>
        </div>

        {/* Info lateral del contacto seleccionado */}
        {value && (
          <div className="hidden lg:flex flex-col text-right shrink-0 max-w-36">
            {value.cargo && (
              <span className="text-[9px] font-semibold text-slate-500 truncate">{value.cargo}</span>
            )}
            {value.fono1 && (
              <span className="text-[9px] font-mono text-slate-400 truncate">{value.fono1}</span>
            )}
          </div>
        )}

        <ChevronDown
          size={15}
          className={`text-slate-400 transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* ── Dropdown ──────────────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="absolute left-0 z-50 mt-2 w-full min-w-[320px] bg-white border border-slate-200 shadow-2xl rounded-3xl overflow-hidden">

          {!vistaCrear ? (
            /* ─ Vista: lista de contactos ─ */
            <>
              {/* Buscador */}
              <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Buscar por nombre, cargo o email…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
                  />
                  {loading && (
                    <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />
                  )}
                </div>
              </div>

              {/* Contador */}
              <div className="px-4 py-1.5 border-b border-slate-100 bg-slate-50/30">
                <p className="text-[8px] font-black uppercase italic text-slate-400">
                  {loading
                    ? "Buscando contactos…"
                    : `${options.length} contacto${options.length !== 1 ? "s" : ""} para este cliente`}
                </p>
              </div>

              {/* Lista */}
              <div className="overflow-y-auto max-h-60">
                {loading ? (
                  <div className="p-6 text-center text-[10px] text-slate-400 font-black uppercase italic">
                    Cargando…
                  </div>
                ) : options.length > 0 ? (
                  options.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        onChange(c);
                        setIsOpen(false);
                        setSearch("");
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors border-b border-slate-50 last:border-none text-left
                        ${value?.id === c.id ? "bg-emerald-50/60" : ""}`}
                    >
                      <div className="p-1.5 bg-slate-100 rounded-lg shrink-0">
                        <User size={13} className="text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-slate-800 uppercase italic truncate">
                          {c.nombre}
                        </p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                          {c.cargo && (
                            <span className="text-[8px] text-slate-500 font-semibold">{c.cargo}</span>
                          )}
                          {c.email && (
                            <span className="text-[8px] font-mono text-slate-400">{c.email}</span>
                          )}
                          {c.fono1 && (
                            <span className="text-[8px] font-mono text-slate-400">{c.fono1}</span>
                          )}
                        </div>
                      </div>
                      {value?.id === c.id && (
                        <Check size={14} className="text-emerald-600 shrink-0" />
                      )}
                    </button>
                  ))
                ) : (
                  <div className="p-6 text-center space-y-1">
                    <p className="text-[10px] text-slate-400 font-black uppercase italic">
                      No hay contactos registrados para este cliente
                    </p>
                    <p className="text-[9px] text-slate-300">
                      Puedes crear uno nuevo abajo
                    </p>
                  </div>
                )}
              </div>

              {/* Acciones del footer */}
              <div className="flex border-t border-slate-100">
                <button
                  type="button"
                  onClick={abrirCrear}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase italic text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all"
                >
                  <Plus size={13} /> Nuevo contacto
                </button>
                {value && (
                  <button
                    type="button"
                    onClick={() => { onChange(null); setIsOpen(false); }}
                    className="flex items-center justify-center gap-1.5 px-4 py-3 text-[10px] font-black uppercase italic text-slate-500 hover:bg-slate-100 border-l border-slate-100 transition-all"
                  >
                    <X size={12} /> Limpiar
                  </button>
                )}
              </div>
            </>
          ) : (
            /* ─ Vista: formulario rápido ─ */
            <div className="p-4 space-y-3">
              {/* Encabezado */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 rounded-lg">
                    <Plus size={12} className="text-emerald-600" />
                  </div>
                  <p className="text-[11px] font-black uppercase italic text-slate-700">
                    Nuevo contacto
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setVistaCrear(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <X size={13} />
                </button>
              </div>

              {/* Cliente al que pertenece */}
              {nombreCliente && (
                <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[8px] font-black uppercase italic text-slate-400">Para</p>
                  <p className="text-[11px] font-black text-slate-700 uppercase italic">
                    {nombreCliente}
                  </p>
                </div>
              )}

              {/* Campo nombre */}
              <div>
                <label className="block text-[9px] font-black uppercase italic text-slate-500 mb-1">
                  Nombre <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    autoFocus
                    type="text"
                    value={nuevoForm.nombre}
                    onChange={(e) => setNuevo("nombre", e.target.value)}
                    placeholder="Nombre completo del contacto"
                    className={`w-full pl-7 pr-3 py-2 text-[11px] border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-slate-50 transition-all
                      ${nuevoErrors.nombre ? "border-red-300" : "border-slate-200"}`}
                  />
                </div>
                {nuevoErrors.nombre && (
                  <p className="text-[9px] text-red-500 mt-0.5 font-semibold">{nuevoErrors.nombre}</p>
                )}
              </div>

              {/* Cargo + Teléfono */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-black uppercase italic text-slate-500 mb-1">
                    Cargo
                  </label>
                  <div className="relative">
                    <Briefcase size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={nuevoForm.cargo}
                      onChange={(e) => setNuevo("cargo", e.target.value)}
                      placeholder="Cargo"
                      className="w-full pl-7 pr-3 py-2 text-[11px] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-slate-50 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase italic text-slate-500 mb-1">
                    Teléfono
                  </label>
                  <div className="relative">
                    <Phone size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={nuevoForm.fono1}
                      onChange={(e) => setNuevo("fono1", e.target.value)}
                      placeholder="+56 9 1234 5678"
                      className="w-full pl-7 pr-3 py-2 text-[11px] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-slate-50 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[9px] font-black uppercase italic text-slate-500 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={nuevoForm.email}
                    onChange={(e) => setNuevo("email", e.target.value)}
                    placeholder="contacto@empresa.cl"
                    className="w-full pl-7 pr-3 py-2 text-[11px] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-slate-50 transition-all"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setVistaCrear(false)}
                  className="flex-1 py-2 text-[10px] font-black uppercase italic text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                >
                  Volver
                </button>
                <button
                  type="button"
                  onClick={handleCrear}
                  disabled={creando}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-black uppercase italic bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl transition-all"
                >
                  {creando ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                  {creando ? "Creando…" : "Crear contacto"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { useRegionalization } from "@/context/RegionalizationContext";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const buildPageRange = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
};

export const PaginationBar = ({
  page,
  totalPages,
  pageSize,
  setPageSize,
  onPageChange,
  total,
  loading,
}) => {
  const { activeTheme } = useTheme();
  const { formatNumber } = useRegionalization();
  const pages = buildPageRange(page, totalPages);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 bg-slate-50 px-6 py-4 md:flex-row">
      <div className="flex items-center gap-4">
        <select
          className="c2c-input-surface cursor-pointer rounded-xl px-3 py-2 text-[10px] font-black uppercase shadow-sm outline-none"
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
          }}
          disabled={loading}
        >
          {[10, 25, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n} por página
            </option>
          ))}
        </select>
        <span className="text-[10px] font-black italic text-slate-600">
          {total === 0
            ? "Sin registros"
            : `Mostrando ${from}–${to} de ${formatNumber(total, { fallback: "0" })} registros`}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <NavBtn onClick={() => onPageChange(1)} disabled={page === 1 || loading} title="Primera">
          <ChevronsLeft size={14} />
        </NavBtn>
        <NavBtn onClick={() => onPageChange(page - 1)} disabled={page === 1 || loading} title="Anterior">
          <ChevronLeft size={14} />
        </NavBtn>

        {pages.map((p, idx) =>
          p === "..." ? (
            <span key={`ellipsis-${idx}`} className="px-2 py-1 text-[10px] font-black text-slate-600">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              disabled={loading}
              className={`min-w-8 h-8 px-2 rounded-xl text-[10px] font-black transition-all ${
                p === page
                  ? activeTheme.accentSolidClass
                  : "c2c-soft-button-neutral border"
              }`}
            >
              {p}
            </button>
          ),
        )}

        <NavBtn
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages || loading || totalPages === 0}
          title="Siguiente"
        >
          <ChevronRight size={14} />
        </NavBtn>
        <NavBtn
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages || loading || totalPages === 0}
          title="Última"
        >
          <ChevronsRight size={14} />
        </NavBtn>
      </div>
    </div>
  );
};

const NavBtn = ({ children, onClick, disabled, title }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className="c2c-soft-button-neutral rounded-xl border p-2 shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-45 active:scale-90"
  >
    {children}
  </button>
);

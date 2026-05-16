import React from "react";

export const MetricCard = ({
  title,
  value,
  icon,
  subValue,
  color = "blue",
  isCritical = false,
}) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    red: "bg-red-50 text-red-600 border-red-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    slate: "bg-slate-50 text-slate-600 border-slate-100",
  };

  return (
    <div
      className={`c2c-card-surface rounded-[2rem] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_42px_rgba(15,23,42,0.08)] ${
        isCritical ? "ring-2 ring-red-500/70 ring-offset-2 ring-offset-transparent" : ""
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div
          className={`rounded-[1.25rem] border p-3 ${colors[isCritical ? "red" : color]}`}
        >
          {icon && React.isValidElement(icon)
            ? React.cloneElement(icon, { size: 24 })
            : null}
        </div>

        {isCritical && (
          <span className="rounded-lg bg-red-600 px-2 py-1 text-[8px] font-black uppercase italic text-white animate-pulse">
            Crítico
          </span>
        )}
      </div>

      <div>
        <p className="mb-1 text-[10px] font-black uppercase italic tracking-[0.18em] text-slate-600">
          {title}
        </p>
        <h3
          className={`text-3xl font-black italic tracking-[-0.08em] ${
            isCritical ? "text-red-600" : "text-slate-800"
          }`}
        >
          {value ?? 0}
        </h3>
        {subValue && (
          <p className="mt-2 text-[9px] font-black uppercase tracking-[0.12em] text-slate-600">
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
};

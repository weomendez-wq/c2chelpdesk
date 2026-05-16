export const TableContainer = ({ children }) => (
  <div className="c2c-card-surface relative overflow-hidden rounded-[1.75rem] transition-all hover:shadow-[0_20px_38px_rgba(15,23,42,0.08)]">
    <table className="w-full border-collapse text-left">{children}</table>
  </div>
);

export const TableHeader = ({ cols }) => (
  <thead className="border-b border-slate-100 bg-slate-50/90">
    <tr>
      {cols.map((col, i) => (
        <th
          key={i}
          className={`p-5 text-[10px] font-black uppercase italic tracking-[0.2em] text-slate-500 ${col.center ? "text-center" : ""}`}
        >
          {col.label}
        </th>
      ))}
    </tr>
  </thead>
);

export const StatusBadge = ({ type, label, pulsing }) => {
  const styles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    error: "border-red-200 bg-red-50 text-red-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-[9px] font-black uppercase italic ${styles[type]} ${pulsing ? "animate-pulse" : ""}`}
    >
      {label}
    </span>
  );
};

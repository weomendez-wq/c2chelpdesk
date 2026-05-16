import React from "react";
import { HardDrive, Circle } from "lucide-react";

export const DeviceTable = ({ data = [] }) => {
  return (
    <div className="overflow-hidden border border-slate-100 rounded-3xl bg-slate-50/50">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white border-b border-slate-100">
            <th className="p-4 text-[9px] font-black uppercase text-slate-400 italic">
              Dispositivo
            </th>
            <th className="p-4 text-[9px] font-black uppercase text-slate-400 italic">
              Estado
            </th>
            <th className="p-4 text-[9px] font-black uppercase text-slate-400 italic">
              Última IP
            </th>
            <th className="p-4 text-[9px] font-black uppercase text-slate-400 italic">
              Sincronización
            </th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item) => (
              <tr
                key={item.id}
                className="transition-colors hover:bg-white group"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 transition-all bg-white shadow-sm rounded-xl group-hover:bg-slate-900 group-hover:text-white">
                      <HardDrive size={14} />
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-700">
                      {item.id}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Circle
                      size={8}
                      fill={item.online ? "#10b981" : "#ef4444"}
                      className={
                        item.online ? "text-emerald-500" : "text-red-500"
                      }
                    />
                    <span className="text-[10px] font-black uppercase italic text-slate-600">
                      {item.online ? "En Línea" : "Desconectado"}
                    </span>
                  </div>
                </td>
                <td className="p-4 font-mono text-[10px] text-slate-400">
                  {item.ip || "0.0.0.0"}
                </td>
                <td className="p-4 text-[10px] font-bold text-slate-500 italic">
                  {item.lastSync || "Nunca"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="4"
                className="p-10 text-center text-[10px] font-black uppercase text-slate-300 italic"
              >
                Sin equipos detectados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

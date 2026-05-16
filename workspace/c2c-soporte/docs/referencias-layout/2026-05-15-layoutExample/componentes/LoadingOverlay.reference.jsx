import React from "react";
import { Loader2 } from "lucide-react";

const LoadingOverlay = ({ isVisible, message = "Cambiando de Tenant..." }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center transition-opacity z-9999 bg-slate-900/60 backdrop-blur-sm">
      <div className="flex flex-col items-center p-8 bg-white border shadow-2xl rounded-3xl border-slate-100">
        <Loader2 className="w-12 h-12 mb-4 text-blue-600 animate-spin" />
        <p className="text-sm font-black tracking-tighter uppercase text-slate-800">
          {message}
        </p>
        <p className="mt-2 text-xs italic text-slate-400">
          Sincronizando con la nube...
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;

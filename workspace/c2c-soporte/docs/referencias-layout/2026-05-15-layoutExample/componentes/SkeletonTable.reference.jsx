// src/components/SkeletonTable.jsx
import React from "react";

const SkeletonRow = () => (
  <div className="flex items-center gap-4 p-6 border-b border-slate-100 animate-pulse">
    <div className="flex-1 space-y-3">
      <div className="w-1/3 h-4 rounded bg-slate-200"></div>
      <div className="w-1/2 h-2 rounded bg-slate-100"></div>
    </div>
    <div className="w-20 h-8 rounded-full bg-slate-200"></div>
    <div className="w-20 h-8 rounded-full bg-slate-200"></div>
    <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
  </div>
);

const SkeletonTable = ({ rows = 5, columns = 5 }) => (
  <div className="w-full p-6 animate-pulse">
    <div className="w-1/4 h-8 mb-8 bg-gray-200 rounded"></div>
    <div className="grid grid-cols-3 gap-4 mb-8">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
      ))}
    </div>
    <div className="space-y-4">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4">
          {[...Array(columns)].map((_, j) => (
            <div key={j} className="flex-1 h-12 bg-gray-100 rounded"></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default SkeletonTable;

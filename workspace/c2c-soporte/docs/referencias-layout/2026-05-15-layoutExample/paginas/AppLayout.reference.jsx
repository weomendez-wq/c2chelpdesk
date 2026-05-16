import React from "react";
import Sidebar from "@/layouts/Sidebar";
import { Toaster } from "react-hot-toast";

const AppLayout = ({ children }) => {
  return (
    <div className="flex w-full h-screen overflow-hidden bg-slate-100">
      <Sidebar />
      <main className="relative flex-1 overflow-y-auto bg-slate-50">
        <div className="p-8 mx-auto max-w-400">{children}</div>
      </main>
      <Toaster position="top-right" />
    </div>
  );
};

export default AppLayout;

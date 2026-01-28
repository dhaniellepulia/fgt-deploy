// layout for the main app

import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function AppLayout() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#1F1F1F] text-white">
      <Sidebar />
      <div className="flex flex-col flex-1 px-10">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;

// layout for the main app

import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "../../auth/AuthContext";

function AppLayout() {
  const { user } = useAuth();
  // const isAdmin = user && Number(user.roleID) === 1;
  const isAdmin =
    user &&
    typeof user.email === "string" &&
    user.email.toLowerCase() === "admin@gmail.com";
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#1F1F1F] text-white">
      {isAdmin ? <AdminSidebar /> : <Sidebar />}
      <div className="flex flex-col flex-1 px-10">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;

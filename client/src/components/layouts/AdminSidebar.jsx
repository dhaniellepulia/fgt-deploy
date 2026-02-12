import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import logo from "../../assets/logo PNE.png";

import {
  Users,
  UserCheck,
  Briefcase,
  BarChart2,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  {
    to: "/admin/accounts",
    label: "Account Management",
    icon: Users,
    end: true,
  },
  {
    to: "/admin/registrationapproval",
    label: "Registration Approval",
    icon: UserCheck,
  },
  { to: "/admin/projects", label: "Projects", icon: Briefcase },
  { to: "/admin/reports", label: "Reports", icon: BarChart2 },
];

function AdminSidebar() {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <>
      <div className="lg:hidden flex items-center justify-between bg-[#4152B3] text-white px-5 py-4">
        <img src={logo} alt="logo" className="h-8" />

        <button onClick={() => setOpen(true)}>
          <Menu size={28} />
        </button>
      </div>

      {open && (
        <div
          onClick={closeMenu}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed lg:static top-0 left-0 z-50
          min-h-screen w-72 lg:w-90
          bg-[#4152B3] text-white
          px-8 py-10
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          flex flex-col justify-between
        `}
      >
        {/* HEADER */}
        <div>
          <div className="flex items-center justify-between mb-10">
            <img src={logo} alt="logo" className="max-w-36" />

            {/* close button (mobile only) */}
            <button className="lg:hidden" onClick={closeMenu}>
              <X size={26} />
            </button>
          </div>

          {/* NAV LINKS */}
          <nav className="space-y-4">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `
                  flex items-center gap-4 px-6 py-4 rounded-full transition
                  ${
                    isActive
                      ? "bg-gradient-to-t from-transparent to-[#272d53]"
                      : "hover:bg-[#3544A3]"
                  }
                `
                }
              >
                <Icon className="w-6 h-6" />
                <span className="text-lg font-bold">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* LOGOUT */}
        <button
          onClick={() => {
            closeMenu();
            logout();
          }}
          className="flex items-center gap-2 text-lg font-semibold text-white bg-[#1b1f3a] px-6 py-3 rounded-full hover:bg-[#14182d] transition-colors"
        >
          <LogOut size={20} /> Logout
        </button>
      </aside>
    </>
  );
}

export default AdminSidebar;

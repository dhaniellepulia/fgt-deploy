//Dashboard > Profile Menu
import { NavLink, Outlet } from "react-router-dom";
import TopBar from "../components/layouts/TopBar.jsx";
const tabs = [
  { label: "Gamer Profile", path: "/profile" },
  { label: "My Game Library", path: "/profile/library" },
  { label: "Reward History", path: "/profile/rewards" },
  { label: "Account & Security", path: "/profile/account" },
];

function Profile() {
  return (
    <div className="  text-white">
      <header className="flex items-center flex-col-reverse md:flex-row justify-between py-15 gap-4">
        <nav className="flex gap-8 ">
          {tabs.map((tab) => (
            <NavLink
              key={tab.label}
              to={tab.path}
              end={tab.path === "/profile"}
              className={({ isActive }) =>
                `text-sm ${
                  isActive
                    ? "text-yellow-400 border-b border-gray-400 pb-2 font-bold"
                    : "text-neutral-400 hover:text-white  font-medium"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
        <TopBar />
      </header>

      <main className="">
        <Outlet />
      </main>
    </div>
  );
}

export default Profile;

// layout for the onboarding process for new users
import { Outlet } from "react-router-dom";
import NavBar from "../ExternalNavBar";
export default function OnboardingLayout() {
  return (
    <div className="min-h-screen bg-[#1F1F1F] text-white">
      {/* Top bar */}
      <header className="mb-0">
        <div className="bg-[#4152B3] text-white">
          <NavBar />
        </div>
      </header>

      {/* Content */}
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}

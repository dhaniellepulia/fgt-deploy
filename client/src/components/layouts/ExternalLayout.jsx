// layout for external web pages (FAQ, player terms, etc.)
import { Outlet, Link } from "react-router-dom";

export default function ExternalLayout() {
  return (
    <div className="min-h-screen text-white">
      <main className="max-w-full">
        <Outlet />
      </main>
    </div>
  );
}

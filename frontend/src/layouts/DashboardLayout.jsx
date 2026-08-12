import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function DashboardLayout() {
  return (
    <div className="relative isolate flex min-h-screen overflow-hidden bg-[#050505] text-white">
      {/* Ambient visual layers */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_0%,rgba(255,107,53,0.14),transparent_28rem),radial-gradient(circle_at_90%_12%,rgba(130,170,255,0.09),transparent_24rem)]"
      />

      <div
        aria-hidden="true"
        className="grid-bg pointer-events-none absolute inset-0 -z-10 opacity-60"
      />

      {/* Sidebar */}
      <aside className="relative z-20 shrink-0">
        <Sidebar />
      </aside>

      {/* Right section */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-10 top-0 -z-10 h-72 w-72 rounded-full bg-orange-500/10 blur-[110px]"
        />

        {/* Navbar */}
        <header className="sticky top-0 z-10 border-b border-white/8 bg-black/30 backdrop-blur-2xl">
          <Navbar />
        </header>

        {/* Page content */}
        <main className="scanlines relative flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto min-h-full w-full max-w-[1800px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;

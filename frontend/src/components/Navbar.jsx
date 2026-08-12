import { useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  LogOut,
  ShieldCheck,
} from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    navigate("/login");
  }

  function getPageTitle() {
    if (location.pathname.startsWith("/history/")) {
      return "Prediction Details";
    }

    switch (location.pathname) {
      case "/dashboard":
        return "Dashboard";
      case "/prediction":
        return "Bearing Prediction";
      case "/history":
        return "Prediction History";
      case "/model":
        return "Model Information";
      default:
        return "BearingIQ";
    }
  }

  function getPageKicker() {
    if (location.pathname.startsWith("/history/")) {
      return "Signal inspection / Detailed record";
    }

    switch (location.pathname) {
      case "/dashboard":
        return "Command center / Live overview";
      case "/prediction":
        return "Diagnostic lab / AI inference";
      case "/history":
        return "Signal archive / Prediction log";
      case "/model":
        return "Model registry / Validation telemetry";
      default:
        return "Predictive maintenance / Bearing intelligence";
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#08080a]/75 px-4 py-4 backdrop-blur-2xl sm:px-6 lg:px-8">
      <div className="flex min-h-12 items-center justify-between gap-5">
        {/* Page identity */}
        <div className="flex min-w-0 items-center gap-4">
          <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-orange-300/20 bg-orange-400/[0.08] text-[var(--accent-bright)] shadow-[0_0_22px_rgba(255,107,53,0.1)] sm:flex">
            <Activity size={19} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="eyebrow truncate">{getPageKicker()}</p>
              <span className="status-live hidden sm:inline-flex">System online</span>
            </div>
            <h1 className="mt-1 truncate text-xl font-semibold tracking-[-0.04em] text-white sm:text-2xl">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        {/* Session controls */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="glass-subtle hidden items-center gap-3 px-3 py-2 md:flex">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-300/10 text-emerald-300">
              <ShieldCheck size={14} />
            </span>
            <div>
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-white/30">
                Workspace
              </p>
              <p className="text-xs font-semibold text-white/75">Authenticated</p>
            </div>
          </div>

          <span className="hidden text-sm text-white/40 lg:inline">
            Welcome back
          </span>

          <button
            type="button"
            onClick={logout}
            className="group inline-flex min-h-10 items-center gap-2 rounded-full border border-red-300/25 bg-red-400/[0.07] px-3.5 py-2 text-sm font-semibold text-red-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-red-300/55 hover:bg-red-400/[0.16] hover:shadow-[0_0_24px_rgba(251,113,133,0.14)] sm:px-4"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Logout</span>
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;

import { NavLink } from "react-router-dom";
import {
  Activity,
  Cpu,
  History,
  LayoutDashboard,
  Radar,
  Sparkles,
  UserRound,
} from "lucide-react";

function Sidebar() {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      description: "Command center",
      icon: LayoutDashboard,
    },
    {
      name: "Prediction",
      path: "/prediction",
      description: "Run diagnosis",
      icon: Radar,
    },
    {
      name: "History",
      path: "/history",
      description: "Signal archive",
      icon: History,
    },
    {
      name: "Model",
      path: "/model",
      description: "Model intelligence",
      icon: Cpu,
    },
    {
      name: "Profile",
      path: "/profile",
      description: "Account center",
      icon: UserRound,
    },
  ];

  return (
    <aside className="group/sidebar relative flex min-h-screen w-20 shrink-0 flex-col overflow-hidden border-r border-white/[0.08] bg-[#08080a]/90 text-white backdrop-blur-2xl lg:w-72">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(255,107,53,0.12),transparent_22rem)]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-cyan-300/[0.04] blur-[100px]" />

      {/* Brand */}
      <div className="relative border-b border-white/[0.08] p-4 lg:p-7">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-orange-300/25 bg-orange-400/[0.08] text-[var(--accent-bright)] shadow-[0_0_24px_rgba(255,107,53,0.12)]">
            <Activity size={21} />
          </div>

          <div className="hidden min-w-0 lg:block">
            <h1 className="truncate text-xl font-semibold tracking-[-0.05em] text-white">
              Bearing<span className="text-[var(--accent-bright)]">IQ</span>
            </h1>
            <p className="mt-1 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-white/35">
              Fault intelligence
            </p>
          </div>
        </div>

        <div className="mt-6 hidden items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-white/30 lg:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(134,239,172,0.8)]" />
          Diagnostic system online
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 px-2 py-5 lg:px-4 lg:py-7" aria-label="Main navigation">
        <p className="mb-4 hidden px-3 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/25 lg:block">
          Workspace
        </p>

        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-300 lg:px-4 ${
                    isActive
                      ? "border border-orange-300/20 bg-orange-400/[0.11] text-white shadow-[0_0_28px_rgba(255,107,53,0.08)]"
                      : "border border-transparent text-white/45 hover:border-white/[0.08] hover:bg-white/[0.045] hover:text-white/85"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-[var(--accent-bright)] shadow-[0_0_12px_rgba(255,147,95,0.9)]" />
                    )}

                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                        isActive
                          ? "bg-orange-400/15 text-[var(--accent-bright)]"
                          : "bg-white/[0.035] text-white/35 group-hover:bg-white/[0.08] group-hover:text-white/75"
                      }`}
                    >
                      <Icon size={17} />
                    </span>

                    <span className="hidden min-w-0 flex-1 lg:block">
                      <span className="block truncate text-sm font-semibold">
                        {item.name}
                      </span>
                      <span
                        className={`mt-0.5 block truncate font-mono text-[0.58rem] uppercase tracking-[0.1em] ${
                          isActive ? "text-orange-200/50" : "text-white/25"
                        }`}
                      >
                        {item.description}
                      </span>
                    </span>

                    <span className="hidden text-white/20 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-white/50 lg:block">
                      →
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Bottom system card */}
      <div className="relative border-t border-white/[0.08] p-3 lg:p-5">
        <div className="glass-subtle flex items-center justify-center gap-3 p-3 lg:justify-start lg:p-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10 text-[var(--cyan)]">
            <Sparkles size={15} />
          </span>
          <div className="hidden min-w-0 lg:block">
            <p className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-white/30">
              Intelligence layer
            </p>
            <p className="mt-1 truncate text-xs font-semibold text-white/70">
              Explainable AI ready
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

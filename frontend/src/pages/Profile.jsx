import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Fingerprint,
  LockKeyhole,
  LogOut,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

function decodeJwtPayload(token) {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized));

    return decoded;
  } catch {
    return null;
  }
}

function isTokenActive(payload) {
  if (!payload?.exp) {
    return Boolean(payload);
  }

  return payload.exp * 1000 > Date.now();
}

function InfoRow({ label, value, icon, mono = false }) {
  return (
    <div className="flex flex-col gap-2 border-b border-white/[0.07] py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <span className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-white/35">
        {icon}
        {label}
      </span>
      <span
        className={`break-all text-sm font-semibold text-white/80 sm:max-w-[65%] sm:text-right ${
          mono ? "font-mono text-[var(--accent-bright)]" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function Profile() {
  const navigate = useNavigate();

  const profile = useMemo(() => {
    const token = localStorage.getItem("access_token");
    const payload = token ? decodeJwtPayload(token) : null;

    if (!payload) {
      return {
        email: "Not available",
        userId: "Not available",
        accountStatus: "Not available",
      };
    }

    const sessionActive = isTokenActive(payload);

    return {
      email: payload.email ?? "Not available",
      userId: payload.sub ?? "Not available",
      accountStatus: sessionActive ? "Active" : "Not available",
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  }

  const profileInitial =
    profile.email && profile.email !== "Not available"
      ? profile.email.charAt(0).toUpperCase()
      : "B";

  const isActive = profile.accountStatus === "Active";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="space-y-8 pb-10"
    >
      {/* Header */}
      <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.025] px-5 py-7 shadow-2xl shadow-black/20 sm:px-8 sm:py-9">
        <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-orange-500/10 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-cyan-300/10 blur-[65px]" />

        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.6rem] border border-orange-300/25 bg-gradient-to-br from-orange-300/20 via-orange-500/10 to-transparent text-3xl font-semibold text-[var(--accent-bright)] shadow-[0_0_38px_rgba(255,107,53,0.16)]">
            {profileInitial}
            <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-4 border-[#0a0a0b] bg-emerald-300 text-[#07130c]">
              <ShieldCheck size={13} />
            </span>
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <p className="eyebrow">BearingIQ / Identity center</p>
              <span className={isActive ? "status-live" : "status-live status-warning"}>
                {isActive ? "Session active" : "Session unavailable"}
              </span>
            </div>

            <h1 className="mt-4 text-4xl font-semibold leading-[0.98] tracking-[-0.07em] text-white sm:text-6xl">
              Your profile.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-2)] sm:text-base">
              Manage your BearingIQ identity and inspect the current authentication session powering your workspace.
            </p>
          </div>
        </div>
      </section>

      {/* Account overview */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="metric-card group">
          <div className="flex items-start justify-between gap-3">
            <p className="metric-label">Account status</p>
            <ShieldCheck size={17} className="text-emerald-300/70 transition-colors group-hover:text-emerald-300" />
          </div>
          <p className={`mt-4 text-2xl font-semibold tracking-tight ${isActive ? "text-emerald-300" : "text-white"}`}>
            {profile.accountStatus}
          </p>
          <p className="metric-delta-neutral">
            {isActive ? "Authenticated workspace" : "Authentication required"}
          </p>
        </div>

        <div className="metric-card group">
          <div className="flex items-start justify-between gap-3">
            <p className="metric-label">Identity type</p>
            <UserRound size={17} className="text-[var(--accent-bright)]/70 transition-colors group-hover:text-[var(--accent-bright)]" />
          </div>
          <p className="mt-4 text-2xl font-semibold tracking-tight text-white">
            BearingIQ user
          </p>
          <p className="metric-delta-neutral">Diagnostic workspace access</p>
        </div>

        <div className="metric-card group">
          <div className="flex items-start justify-between gap-3">
            <p className="metric-label">Security layer</p>
            <LockKeyhole size={17} className="text-[var(--cyan)]/70 transition-colors group-hover:text-[var(--cyan)]" />
          </div>
          <p className="mt-4 text-2xl font-semibold tracking-tight text-[var(--cyan)]">
            Protected
          </p>
          <p className="metric-delta-up">JWT session verified</p>
        </div>
      </section>

      {/* Account information and security */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card p-5 sm:p-7">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-400/10 text-[var(--accent-bright)]">
              <UserRound size={19} />
            </span>
            <div>
              <p className="eyebrow">Identity data</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">
                Account information
              </h2>
            </div>
          </div>

          <div>
            <InfoRow
              label="Email"
              value={profile.email}
              icon={<Mail size={13} />}
            />
            <InfoRow
              label="User ID"
              value={profile.userId}
              icon={<Fingerprint size={13} />}
              mono
            />
            <InfoRow
              label="Account status"
              value={profile.accountStatus}
              icon={<ShieldCheck size={13} />}
            />
          </div>
        </div>

        <div className="glass-card relative overflow-hidden p-5 sm:p-7">
          <div className="absolute -bottom-16 -right-16 h-44 w-44 rounded-full bg-cyan-300/10 blur-[70px]" />

          <div className="relative">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300/10 text-[var(--cyan)]">
                <Sparkles size={19} />
              </span>
              <div>
                <p className="eyebrow">Workspace protection</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">
                  Session security
                </h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="glass-subtle flex items-start gap-3 p-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-300/10 text-emerald-300">
                  <ShieldCheck size={15} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Token verification</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--text-2)]">
                    Your access session is checked before exposing workspace identity data.
                  </p>
                </div>
              </div>

              <div className="glass-subtle flex items-start gap-3 p-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-400/10 text-[var(--accent-bright)]">
                  <Fingerprint size={15} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Private identity</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--text-2)]">
                    Your profile is connected to the authenticated user ID shown above.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Account actions */}
      <section className="glass-card border-red-300/15 bg-red-400/[0.025] p-5 sm:p-7">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow text-red-300">Account control</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              Sign out of BearingIQ
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-2)]">
              End this session and return to the login screen. Your local access and refresh tokens will be removed.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex min-h-[2.9rem] shrink-0 items-center justify-center gap-2 rounded-full border border-red-300/35 bg-red-400/[0.1] px-5 py-3 text-sm font-semibold text-red-200 transition hover:border-red-300/65 hover:bg-red-400/[0.2] hover:shadow-[0_0_26px_rgba(251,113,133,0.15)]"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </section>
    </motion.div>
  );
}

export default Profile;

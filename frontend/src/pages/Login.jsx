import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { loginUser } from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await loginUser({
        email,
        password,
      });

      console.log("Login Response:", response);

      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("refresh_token", response.refresh_token);

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid-bg relative isolate flex min-h-screen items-center overflow-hidden bg-[#050505] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_15%,rgba(255,107,53,0.16),transparent_28rem),radial-gradient(circle_at_90%_85%,rgba(125,231,219,0.1),transparent_25rem)]" />
      <div className="orb -right-24 top-10 hidden opacity-25 lg:block" style={{ "--orb-size": "18rem" }} />

      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/[0.1] bg-black/30 shadow-2xl shadow-black/40 backdrop-blur-2xl lg:grid-cols-[1.05fr_0.95fr]">
        {/* Brand panel */}
        <section className="relative hidden min-h-[680px] overflow-hidden border-r border-white/[0.08] p-8 lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div className="absolute -left-28 -top-28 h-80 w-80 rounded-full bg-orange-500/15 blur-[100px]" />
          <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-cyan-300/10 blur-[100px]" />

          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-300/30 bg-orange-400/10 text-[var(--accent-bright)] shadow-[0_0_25px_rgba(255,107,53,0.14)]">
                <Activity size={21} />
              </div>
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-white/60">
                BearingIQ
              </span>
            </div>

            <div className="mt-28 max-w-lg">
              <p className="eyebrow">Predictive maintenance / 01</p>
              <h1 className="mt-5 text-5xl font-semibold leading-[0.94] tracking-[-0.08em] text-white xl:text-7xl">
                See the signal before it becomes a failure.
              </h1>
              <p className="mt-7 max-w-md text-base leading-8 text-white/45">
                Enter the BearingIQ command center to monitor bearing health, explore model intelligence, and turn vibration data into decisions.
              </p>
            </div>
          </div>

          <div className="relative grid grid-cols-2 gap-3">
            <div className="glass-subtle p-4">
              <Sparkles size={17} className="text-[var(--accent-bright)]" />
              <p className="mt-4 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-white/35">
                Explainable
              </p>
              <p className="mt-1 text-sm font-semibold text-white/80">
                AI diagnostics
              </p>
            </div>
            <div className="glass-subtle p-4">
              <ShieldCheck size={17} className="text-[var(--cyan)]" />
              <p className="mt-4 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-white/35">
                Secure
              </p>
              <p className="mt-1 text-sm font-semibold text-white/80">
                Session protected
              </p>
            </div>
          </div>
        </section>

        {/* Login panel */}
        <motion.section
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative flex min-h-[680px] flex-col justify-center p-6 sm:p-10 lg:p-12"
        >
          <div className="mb-10 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-300/30 bg-orange-400/10 text-[var(--accent-bright)]">
                <Activity size={21} />
              </div>
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-white/60">
                BearingIQ
              </span>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-3">
              <p className="eyebrow">Welcome back / Secure access</p>
              <span className="status-live">Online</span>
            </div>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.07em] text-white sm:text-5xl">
              Enter the lab.
            </h2>
            <p className="mt-4 text-sm leading-6 text-white/40">
              Sign in to continue to your BearingIQ diagnostic workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="group block">
              <span className="mb-2 flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-white/45 transition-colors group-focus-within:text-[var(--accent-bright)]">
                <Mail size={13} />
                Email address
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-xl border border-white/[0.1] bg-white/[0.035] px-4 py-3.5 text-sm text-white outline-none transition-all placeholder:text-white/20 hover:border-white/20 focus:border-orange-300/50 focus:bg-orange-400/[0.05] focus:ring-2 focus:ring-orange-400/15"
                required
              />
            </label>

            <label className="group block">
              <span className="mb-2 flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-white/45 transition-colors group-focus-within:text-[var(--accent-bright)]">
                <LockKeyhole size={13} />
                Password
              </span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-white/[0.1] bg-white/[0.035] px-4 py-3.5 pr-12 text-sm text-white outline-none transition-all placeholder:text-white/20 hover:border-white/20 focus:border-orange-300/50 focus:bg-orange-400/[0.05] focus:ring-2 focus:ring-orange-400/15"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-white/30 transition hover:bg-white/10 hover:text-[var(--accent-bright)]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-red-300/20 bg-red-400/[0.08] p-3.5 text-sm text-red-200"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-3 flex w-full disabled:cursor-wait disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#180b06]/30 border-t-[#180b06]" />
                  Signing in...
                </>
              ) : (
                <>
                  Access workspace
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-3 text-xs text-white/25">
            <div className="h-px flex-1 bg-white/[0.08]" />
            <span className="font-mono uppercase tracking-[0.14em]">or</span>
            <div className="h-px flex-1 bg-white/[0.08]" />
          </div>

          <p className="mt-7 text-center text-sm text-white/40">
            Don&apos;t have an account?
            <Link
              to="/register"
              className="ml-2 font-semibold text-[var(--accent-bright)] transition hover:text-white"
            >
              Create one <ArrowRight size={13} className="ml-1 inline" />
            </Link>
          </p>

          <p className="mt-10 text-center font-mono text-[0.6rem] uppercase tracking-[0.13em] text-white/20">
            BearingIQ / Secure diagnostic intelligence
          </p>
        </motion.section>
      </div>
    </main>
  );
}

export default Login;

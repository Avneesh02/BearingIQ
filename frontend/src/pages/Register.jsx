import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { registerUser } from "../services/api";

function formatErrorMessage(error) {
  if (!error) {
    return "Registration failed. Please try again.";
  }

  if (typeof error === "string") {
    return error;
  }

  if (Array.isArray(error)) {
    return error
      .map((item) => item.msg || item.message || "Validation error")
      .join(". ");
  }

  return "Registration failed. Please try again.";
}

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        full_name: username.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
      });

      setSuccess("Registration successful. Please login.");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(formatErrorMessage(err.message));
    } finally {
      setLoading(false);
    }
  }

  const passwordStrength =
    password.length === 0
      ? 0
      : password.length < 8
      ? 1
      : password.length < 12
      ? 2
      : 3;

  const strengthLabel = ["", "Needs work", "Good", "Strong"][passwordStrength];
  const strengthColor = [
    "transparent",
    "#fb7185",
    "#fbbf24",
    "#86efac",
  ][passwordStrength];

  return (
    <main className="grid-bg relative isolate flex min-h-screen items-center overflow-hidden bg-[#050505] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_10%,rgba(255,107,53,0.16),transparent_28rem),radial-gradient(circle_at_90%_85%,rgba(125,231,219,0.1),transparent_25rem)]" />
      <div className="orb -left-24 bottom-10 hidden opacity-25 lg:block" style={{ "--orb-size": "18rem" }} />

      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/[0.1] bg-black/30 shadow-2xl shadow-black/40 backdrop-blur-2xl lg:grid-cols-[0.95fr_1.05fr]">
        {/* Brand panel */}
        <section className="relative hidden min-h-[760px] overflow-hidden border-r border-white/[0.08] p-8 lg:flex lg:flex-col lg:justify-between lg:p-12">
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
              <p className="eyebrow">Predictive maintenance / 02</p>
              <h1 className="mt-5 text-5xl font-semibold leading-[0.94] tracking-[-0.08em] text-white xl:text-7xl">
                Build a sharper view of every machine.
              </h1>
              <p className="mt-7 max-w-md text-base leading-8 text-white/45">
                Create your BearingIQ account and enter an intelligent workspace built for faster, clearer bearing diagnostics.
              </p>
            </div>
          </div>

          <div className="relative space-y-3">
            <div className="glass-subtle flex items-start gap-3 p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-400/10 text-[var(--accent-bright)]">
                <Sparkles size={16} />
              </span>
              <div>
                <p className="text-sm font-semibold text-white/80">Built for signal clarity</p>
                <p className="mt-1 text-xs leading-5 text-white/35">
                  Monitor, classify, and understand machine health from one command center.
                </p>
              </div>
            </div>
            <div className="glass-subtle flex items-start gap-3 p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10 text-[var(--cyan)]">
                <ShieldCheck size={16} />
              </span>
              <div>
                <p className="text-sm font-semibold text-white/80">Secure by design</p>
                <p className="mt-1 text-xs leading-5 text-white/35">
                  Your diagnostic workspace is protected by authenticated sessions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Registration panel */}
        <motion.section
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative flex min-h-[760px] flex-col justify-center p-6 sm:p-10 lg:p-12"
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
              <p className="eyebrow">New workspace / Get started</p>
              <span className="status-live">Open access</span>
            </div>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.07em] text-white sm:text-5xl">
              Create your account.
            </h2>
            <p className="mt-4 text-sm leading-6 text-white/40">
              Set up your identity and start exploring the BearingIQ diagnostic lab.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="group block">
              <span className="mb-2 flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-white/45 transition-colors group-focus-within:text-[var(--accent-bright)]">
                <UserRound size={13} />
                Username
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                autoComplete="username"
                minLength={3}
                className="w-full rounded-xl border border-white/[0.1] bg-white/[0.035] px-4 py-3.5 text-sm text-white outline-none transition-all placeholder:text-white/20 hover:border-white/20 focus:border-orange-300/50 focus:bg-orange-400/[0.05] focus:ring-2 focus:ring-orange-400/15"
                required
              />
            </label>

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
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
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

              <div className="mt-3 flex items-center gap-3">
                <div className="flex flex-1 gap-1">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className="h-1 flex-1 rounded-full transition-colors duration-300"
                      style={{
                        background:
                          passwordStrength >= level
                            ? strengthColor
                            : "rgba(255,255,255,0.08)",
                      }}
                    />
                  ))}
                </div>
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-white/30">
                  {strengthLabel || "8+ chars"}
                </span>
              </div>
            </label>

            <label className="group block">
              <span className="mb-2 flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-white/45 transition-colors group-focus-within:text-[var(--accent-bright)]">
                <ShieldCheck size={13} />
                Confirm password
              </span>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  minLength={8}
                  className={`w-full rounded-xl border bg-white/[0.035] px-4 py-3.5 pr-12 text-sm text-white outline-none transition-all placeholder:text-white/20 hover:border-white/20 focus:bg-orange-400/[0.05] focus:ring-2 focus:ring-orange-400/15 ${
                    confirmPassword && password === confirmPassword
                      ? "border-emerald-300/40 focus:border-emerald-300/60"
                      : "border-white/[0.1] focus:border-orange-300/50"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((previous) => !previous)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-white/30 transition hover:bg-white/10 hover:text-[var(--accent-bright)]"
                  aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
                >
                  {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {confirmPassword && password === confirmPassword && (
                <span className="mt-2 flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-emerald-300">
                  <Check size={13} /> Passwords match
                </span>
              )}
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

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.08] p-3.5 text-sm text-emerald-200"
              >
                <Check size={17} className="shrink-0 text-emerald-300" />
                {success}
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
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-white/40">
            Already have an account?
            <Link
              to="/login"
              className="ml-2 font-semibold text-[var(--accent-bright)] transition hover:text-white"
            >
              Sign in <ArrowRight size={13} className="ml-1 inline" />
            </Link>
          </p>

          <p className="mt-8 text-center font-mono text-[0.6rem] uppercase tracking-[0.13em] text-white/20">
            BearingIQ / Secure diagnostic intelligence
          </p>
        </motion.section>
      </div>
    </main>
  );
}

export default Register;

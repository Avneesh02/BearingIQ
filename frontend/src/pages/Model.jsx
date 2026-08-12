import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  CheckCircle2,
  Clock3,
  Cpu,
  Database,
  Gauge,
  RefreshCw,
  ServerCog,
  TriangleAlert,
} from "lucide-react";
import { getActiveModel } from "../services/api";
import { formatMetricPercent, withVerifiedMetrics } from "../utils/modelMetrics";

function formatDate(dateString) {
  if (!dateString) {
    return "N/A";
  }

  return new Date(dateString).toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getMetricColor(value) {
  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) return "#88837d";
  if (numericValue >= 90) return "#86efac";
  if (numericValue >= 70) return "#d7f36b";
  if (numericValue >= 50) return "#fbbf24";
  return "#fb7185";
}

function Metric({ label, value }) {
  const hasValue = value !== null && value !== undefined;
  const numericValue = hasValue ? Number(value) : 0;
  const percentage = Number.isNaN(numericValue)
    ? 0
    : Math.min(Math.max(numericValue, 0), 100);
  const color = getMetricColor(value);

  return (
    <div className="metric-card group">
      <div className="flex items-start justify-between gap-3">
        <p className="metric-label">{label}</p>
        <Gauge
          size={16}
          className="text-white/20 transition-colors group-hover:text-[var(--accent-bright)]"
        />
      </div>

      <p className="mt-4 text-3xl font-semibold tracking-[-0.07em] text-white">
        {hasValue ? formatMetricPercent(value) : "N/A"}
      </p>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{
            background: color,
            boxShadow: `0 0 14px ${color}77`,
          }}
        />
      </div>
    </div>
  );
}

function Detail({ label, value, icon }) {
  return (
    <div className="flex flex-col gap-2 border-b border-white/[0.07] py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <span className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-white/35">
        {icon}
        {label}
      </span>
      <span className="break-all text-sm font-semibold text-white/80 sm:max-w-[62%] sm:text-right">
        {value || "N/A"}
      </span>
    </div>
  );
}

function StatusPill({ active }) {
  return (
    <span className={active ? "status-live" : "status-live status-warning"}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function Model() {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadModel() {
    setLoading(true);
    setError("");

    try {
      const data = await getActiveModel();
      setModel(withVerifiedMetrics(data));
    } catch (err) {
      setError(err.message || "Failed to load model information.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadModel();
  }, []);

  const performanceMetrics = useMemo(
    () => [
      { label: "Accuracy", value: model?.accuracy },
      { label: "Precision", value: model?.precision_score },
      { label: "Recall", value: model?.recall_score },
      { label: "F1 score", value: model?.f1_score },
      { label: "Cross validation", value: model?.cross_validation_accuracy },
    ],
    [model]
  );

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <div className="skeleton h-3 w-36" />
          <div className="skeleton h-12 w-80 max-w-full" />
          <div className="skeleton h-4 w-[30rem] max-w-full" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="glass-card space-y-5 p-6">
              <div className="skeleton h-3 w-24" />
              <div className="skeleton h-9 w-40" />
            </div>
          ))}
        </div>

        <div className="glass-card h-72 p-6">
          <div className="skeleton h-full w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.025] px-5 py-7 sm:px-8 sm:py-9">
          <p className="eyebrow">BearingIQ / Model registry</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.07em] text-white sm:text-6xl">
            ML model.
          </h1>
          <p className="mt-4 text-sm text-[var(--text-2)] sm:text-base">
            Inspect the active machine learning model powering bearing fault diagnosis.
          </p>
        </section>

        <div className="glass-card border-red-300/25 bg-red-400/[0.08] p-5 text-red-200">
          <div className="flex items-start gap-3">
            <TriangleAlert size={19} className="mt-0.5 shrink-0 text-red-300" />
            <div>
              <p className="font-semibold">Unable to load model information</p>
              <p className="mt-1 text-sm text-red-200/70">{error}</p>
            </div>
          </div>
        </div>

        <button type="button" onClick={loadModel} className="btn-primary">
          <RefreshCw size={15} />
          Retry sync
        </button>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.025] px-5 py-7 sm:px-8 sm:py-9">
          <p className="eyebrow">BearingIQ / Model registry</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.07em] text-white sm:text-6xl">
            ML model.
          </h1>
        </section>

        <div className="glass-card p-10 text-center text-[var(--text-2)]">
          <Database size={28} className="mx-auto mb-4 text-white/25" />
          No model information available.
        </div>
      </div>
    );
  }

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

        <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="eyebrow">BearingIQ / Model registry</p>
              <StatusPill active={model.is_active} />
            </div>

            <h1 className="mt-4 text-4xl font-semibold leading-[0.98] tracking-[-0.07em] text-white sm:text-6xl">
              The intelligence layer.
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--text-2)] sm:text-base">
              Inspect the active machine learning model behind your bearing fault diagnosis pipeline, from identity to performance.
            </p>
          </div>

          <button
            type="button"
            onClick={loadModel}
            disabled={loading}
            className="btn-primary disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            {loading ? "Syncing..." : "Refresh model"}
          </button>
        </div>
      </section>

      {/* Model overview */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass-card group p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="metric-label">Model identity</p>
              <h2 className="mt-4 break-words text-2xl font-semibold tracking-tight text-white">
                {model.model_name || "N/A"}
              </h2>
              <p className="mt-2 font-mono text-xs uppercase tracking-[0.12em] text-[var(--text-2)]">
                Version {model.version || "N/A"}
              </p>
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-400/10 text-[var(--accent-bright)] transition-transform duration-300 group-hover:scale-110">
              <Cpu size={21} />
            </span>
          </div>
        </div>

        <div className="glass-card group p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="metric-label">Algorithm</p>
              <h2 className="mt-4 break-words text-2xl font-semibold tracking-tight text-white">
                {model.algorithm || "N/A"}
              </h2>
              <p className="mt-2 font-mono text-xs uppercase tracking-[0.12em] text-[var(--text-2)]">
                Classification engine
              </p>
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-300/10 text-[var(--cyan)] transition-transform duration-300 group-hover:scale-110">
              <ServerCog size={21} />
            </span>
          </div>
        </div>

        <div className="glass-card group p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="metric-label">Runtime status</p>
              <div className="mt-4">
                <StatusPill active={model.is_active} />
              </div>
              <p className="mt-3 font-mono text-xs uppercase tracking-[0.12em] text-[var(--text-2)]">
                {model.is_active ? "Ready for inference" : "Requires attention"}
              </p>
            </div>
            <span className={model.is_active ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-300/10 text-emerald-300 transition-transform duration-300 group-hover:scale-110" : "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-400/10 text-red-300 transition-transform duration-300 group-hover:scale-110"}>
              {model.is_active ? <CheckCircle2 size={21} /> : <TriangleAlert size={21} />}
            </span>
          </div>
        </div>
      </section>

      {/* Performance */}
      <section className="chart-shell">
        <div className="relative z-[1] mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Validation telemetry</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Model performance.
            </h2>
            <p className="mt-2 text-sm text-[var(--text-2)]">
              Verified test-set metrics for the tuned Random Forest model (held-out evaluation).
            </p>
          </div>
          <Activity size={24} className="text-[var(--accent-bright)]" />
        </div>

        <div className="relative z-[1] grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {performanceMetrics.map((metric) => (
            <Metric key={metric.label} label={metric.label} value={metric.value} />
          ))}
        </div>
      </section>

      {/* Details and description */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card p-5 sm:p-7">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-400/10 text-[var(--accent-bright)]">
              <Database size={19} />
            </span>
            <div>
              <p className="eyebrow">Registry metadata</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">
                Model details
              </h2>
            </div>
          </div>

          <div>
            <Detail label="Model name" value={model.model_name} icon={<Cpu size={13} />} />
            <Detail label="Algorithm" value={model.algorithm} icon={<ServerCog size={13} />} />
            <Detail label="Version" value={model.version} icon={<Activity size={13} />} />
            <Detail label="Trained on" value={formatDate(model.trained_on)} icon={<Clock3 size={13} />} />
            <Detail label="Created at" value={formatDate(model.created_at)} icon={<Clock3 size={13} />} />
            <Detail label="Updated at" value={formatDate(model.updated_at)} icon={<RefreshCw size={13} />} />
          </div>
        </div>

        <div className="glass-card p-5 sm:p-7">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300/10 text-[var(--cyan)]">
              <Activity size={19} />
            </span>
            <div>
              <p className="eyebrow">System documentation</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">
                Description
              </h2>
            </div>
          </div>

          <p className="leading-7 text-[var(--text-2)]">
            {model.description || "No description available."}
          </p>

          <div className="mt-8">
            <p className="metric-label mb-3">Model path</p>
            <div className="break-all rounded-2xl border border-white/[0.07] bg-black/25 p-4 font-mono text-xs leading-6 text-white/55">
              {model.model_path || "N/A"}
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

export default Model;

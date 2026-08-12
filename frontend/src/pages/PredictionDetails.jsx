import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Gauge,
  Hash,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { getPredictionDetails } from "../services/api";

function formatLabel(value) {
  return value?.replace(/_/g, " ") ?? "";
}

function formatDate(value) {
  if (!value) return "N/A";

  return new Date(value).toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getConfidenceColor(confidence) {
  const value = Number(confidence || 0);

  if (value >= 80) return "#86efac";
  if (value >= 55) return "#fbbf24";
  return "#fb7185";
}

function ConfidenceDial({ confidence }) {
  const percentage = Math.min(Math.max(Number(confidence || 0), 0), 100);
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color = getConfidenceColor(percentage);

  return (
    <div className="relative flex shrink-0 items-center justify-center">
      <svg width="175" height="175" viewBox="0 0 175 175">
        <circle
          cx="87.5"
          cy="87.5"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="11"
        />
        <circle
          cx="87.5"
          cy="87.5"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 87.5 87.5)"
          style={{
            transition: "stroke-dashoffset 1s ease, stroke 0.5s ease",
            filter: `drop-shadow(0 0 10px ${color}88)`,
          }}
        />
        <text
          x="87.5"
          y="84"
          textAnchor="middle"
          fill={color}
          fontSize="24"
          fontWeight="700"
          fontFamily="DM Mono, monospace"
        >
          {percentage.toFixed(1)}%
        </text>
        <text
          x="87.5"
          y="104"
          textAnchor="middle"
          fill="rgba(255,255,255,0.42)"
          fontSize="10"
          fontFamily="DM Mono, monospace"
          letterSpacing="1.2"
        >
          CONFIDENCE
        </text>
      </svg>
    </div>
  );
}

function DetailRow({ label, value, icon }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-white/[0.07] py-4 last:border-0">
      <span className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-white/35">
        {icon}
        {label}
      </span>
      <span className="max-w-[62%] text-right text-sm font-semibold capitalize text-white/80">
        {value}
      </span>
    </div>
  );
}

function DataTable({ headers, rows }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/[0.07]">
      <table className="w-full min-w-[480px] border-collapse">
        <thead className="bg-black/20">
          <tr className="border-b border-white/[0.07]">
            {headers.map((header) => (
              <th
                key={header}
                className="px-4 py-4 text-left font-mono text-[0.65rem] font-normal uppercase tracking-[0.14em] text-[var(--text-3)]"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={index}
              className="border-b border-white/[0.06] transition-colors last:border-0 hover:bg-orange-400/[0.045]"
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-4 py-4 text-sm capitalize text-white/70"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProbabilityBars({ rows }) {
  const values = rows.map(([, value]) => parseFloat(value));
  const maxValue = Math.max(...values, 1);

  return (
    <div className="space-y-5">
      {rows.map(([label, value]) => {
        const numericValue = parseFloat(value);
        const width = (numericValue / maxValue) * 100;

        return (
          <div key={label}>
            <div className="mb-2 flex items-center justify-between gap-4">
              <span className="text-sm capitalize text-white/70">{label}</span>
              <span className="font-mono text-sm font-semibold text-[var(--accent-bright)]">
                {value}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${width}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-[var(--accent-strong)] via-[var(--accent-bright)] to-[var(--lime)] shadow-[0_0_18px_rgba(255,107,53,0.35)]"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InfluenceBars({ rows, negativeColor = "#fb7185", positiveColor = "#a5b4fc" }) {
  const maxValue = Math.max(
    ...rows.map(([, value]) => Math.abs(parseFloat(value))),
    1
  );

  return (
    <div className="space-y-4">
      {rows.map(([label, value]) => {
        const numericValue = parseFloat(value);
        const width = Math.min((Math.abs(numericValue) / maxValue) * 100, 100);
        const isPositive = numericValue >= 0;
        const color = isPositive ? positiveColor : negativeColor;

        return (
          <div key={label}>
            <div className="mb-2 flex items-center justify-between gap-4">
              <span className="truncate text-xs capitalize text-white/60">{label}</span>
              <span className="shrink-0 font-mono text-xs font-semibold" style={{ color }}>
                {isPositive ? "+" : ""}
                {value}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${width}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{
                  background: color,
                  boxShadow: `0 0 14px ${color}66`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/[0.12] bg-black/20 p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/35">
        <Activity size={22} />
      </div>
      <p className="text-sm text-[var(--text-2)]">{message}</p>
    </div>
  );
}

function PredictionDetails() {
  const { predictionId } = useParams();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDetails() {
      setLoading(true);
      setError("");

      try {
        const response = await getPredictionDetails(predictionId);
        setResult(response);
      } catch (err) {
        setError(err.message || "Failed to load prediction details.");
      } finally {
        setLoading(false);
      }
    }

    if (predictionId) {
      loadDetails();
    }
  }, [predictionId]);

  const probabilityRows = useMemo(() => {
    if (!result?.probabilities) return [];

    return Object.entries(result.probabilities)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => [
        formatLabel(label),
        `${Number(value).toFixed(2)}%`,
      ]);
  }, [result]);

  const topFeatureRows = useMemo(() => {
    if (!result?.top_features) return [];

    return Object.entries(result.top_features)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .map(([feature, value]) => [
        formatLabel(feature),
        Number(value).toFixed(4),
      ]);
  }, [result]);

  const shapRows = useMemo(() => {
    if (!result?.shap_values) return [];

    return Object.entries(result.shap_values)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .map(([feature, value]) => [
        formatLabel(feature),
        Number(value).toFixed(4),
      ]);
  }, [result]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <div className="skeleton h-3 w-36" />
          <div className="skeleton h-12 w-96 max-w-full" />
          <div className="skeleton h-4 w-[30rem] max-w-full" />
        </div>

        <div className="glass-card grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="space-y-4">
              <div className="skeleton h-3 w-24" />
              <div className="skeleton h-8 w-32" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="glass-card h-72 p-6">
            <div className="skeleton h-full w-full" />
          </div>
          <div className="glass-card h-72 p-6">
            <div className="skeleton h-full w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="glass-card border-red-300/25 bg-red-400/[0.08] p-5 text-red-200">
          <div className="flex items-start gap-3">
            <TriangleAlert size={19} className="mt-0.5 shrink-0 text-red-300" />
            <div>
              <p className="font-semibold">Unable to load prediction details</p>
              <p className="mt-1 text-sm text-red-200/70">{error}</p>
            </div>
          </div>
        </div>

        <Link to="/history" className="btn-secondary">
          <ArrowLeft size={15} />
          Back to history
        </Link>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6 text-[var(--text-2)]">
          Prediction not found.
        </div>
        <Link to="/history" className="btn-secondary">
          <ArrowLeft size={15} />
          Back to history
        </Link>
      </div>
    );
  }

  const confidenceColor = getConfidenceColor(result.confidence);

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

        <div className="relative">
          <Link
            to="/history"
            className="btn-ghost mb-5 -ml-2"
          >
            <ArrowLeft size={15} />
            Back to history
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <p className="eyebrow">BearingIQ / Signal inspection</p>
            <span className="status-live">Record loaded</span>
          </div>

          <h1 className="mt-4 text-4xl font-semibold leading-[0.98] tracking-[-0.07em] text-white sm:text-6xl">
            Prediction details.
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--text-2)] sm:text-base">
            A complete diagnostic breakdown of the model verdict, confidence, class probabilities, and feature influence.
          </p>
        </div>
      </section>

      {/* Verdict */}
      <section className="chart-shell overflow-hidden">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-orange-400/10 blur-[90px]" />

        <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_auto_1fr]">
          <div>
            <p className="eyebrow">Model verdict</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-300">
                <CheckCircle2 size={24} />
              </span>
              <div>
                <h2 className="text-3xl font-semibold capitalize tracking-tight text-white sm:text-4xl">
                  {formatLabel(result.prediction)}
                </h2>
                <p className="mt-1 text-sm text-[var(--text-2)]">
                  Classification result from BearingIQ inference.
                </p>
              </div>
            </div>
          </div>

          <ConfidenceDial confidence={result.confidence} />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="glass-subtle min-w-[12rem] p-4">
              <DetailRow
                label="Prediction ID"
                value={`#${result.prediction_id}`}
                icon={<Hash size={13} />}
              />
            </div>
            <div className="glass-subtle min-w-[12rem] p-4">
              <DetailRow
                label="Prediction time"
                value={formatDate(result.prediction_time)}
                icon={<Clock3 size={13} />}
              />
            </div>
            <div className="glass-subtle min-w-[12rem] p-4">
              <DetailRow
                label="Confidence"
                value={`${Number(result.confidence).toFixed(1)}%`}
                icon={<Gauge size={13} />}
              />
            </div>
          </div>
        </div>

        <div className="relative mt-8 h-2 overflow-hidden rounded-full bg-white/[0.07]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(Number(result.confidence || 0), 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${confidenceColor}99, ${confidenceColor})`,
              boxShadow: `0 0 18px ${confidenceColor}88`,
            }}
          />
        </div>
      </section>

      {/* Probability analysis */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-card p-5 sm:p-7">
          <div className="mb-7 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300/10 text-[var(--cyan)]">
              <BarChart3 size={19} />
            </span>
            <div>
              <p className="eyebrow">Classification spread</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">
                Class probabilities
              </h2>
            </div>
          </div>

          {probabilityRows.length > 0 ? (
            <>
              <ProbabilityBars rows={probabilityRows} />
              <div className="mt-8">
                <DataTable
                  headers={["Class name", "Probability"]}
                  rows={probabilityRows}
                />
              </div>
            </>
          ) : (
            <EmptyState message="No probability data available." />
          )}
        </div>

        <div className="glass-card p-5 sm:p-7">
          <div className="mb-7 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-400/10 text-[var(--accent-bright)]">
              <Sparkles size={19} />
            </span>
            <div>
              <p className="eyebrow">Primary drivers</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">
                Top important features
              </h2>
            </div>
          </div>

          {topFeatureRows.length > 0 ? (
            <>
              <InfluenceBars rows={topFeatureRows} />
              <div className="mt-8">
                <DataTable
                  headers={["Feature", "Value"]}
                  rows={topFeatureRows}
                />
              </div>
            </>
          ) : (
            <EmptyState message="No top feature data available." />
          )}
        </div>
      </section>

      {/* SHAP analysis */}
      <section className="glass-card p-5 sm:p-7">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Explainable AI layer</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              SHAP value analysis
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-2)]">
              Positive values push the model toward the predicted class; negative values pull it away.
            </p>
          </div>
          <span className="font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[var(--text-3)]">
            {shapRows.length} features analyzed
          </span>
        </div>

        {shapRows.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_0.9fr]">
            <InfluenceBars
              rows={shapRows}
              positiveColor="#7de7db"
              negativeColor="#fb7185"
            />
            <DataTable
              headers={["Feature", "SHAP value"]}
              rows={shapRows}
            />
          </div>
        ) : (
          <EmptyState message="No SHAP values available." />
        )}
      </section>

      {/* Footer action */}
      <div className="flex justify-start">
        <Link to="/history" className="btn-primary">
          <ArrowLeft size={15} />
          Return to history
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
}

export default PredictionDetails;

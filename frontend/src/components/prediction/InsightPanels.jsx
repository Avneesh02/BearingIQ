import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart2,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
} from "lucide-react";
import { getFaultConfig } from "../../utils/faultConfig";

export function ConfidenceDial({ confidence }) {
  const pct = Math.min(Math.max(confidence, 0), 100);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const color = pct >= 80 ? "#22c55e" : pct >= 55 ? "#f59e0b" : "#ef4444";

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle
        cx="70"
        cy="70"
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="10"
      />
      <circle
        cx="70"
        cy="70"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 70 70)"
        style={{ transition: "stroke-dashoffset 1s ease, stroke 0.5s" }}
      />
      <text
        x="70"
        y="66"
        textAnchor="middle"
        fill={color}
        fontSize="22"
        fontWeight="bold"
        fontFamily="Inter,sans-serif"
      >
        {pct.toFixed(1)}%
      </text>
      <text
        x="70"
        y="84"
        textAnchor="middle"
        fill="rgba(255,255,255,0.4)"
        fontSize="11"
        fontFamily="Inter,sans-serif"
      >
        Confidence
      </text>
    </svg>
  );
}

export function ProbabilityBar({ label, value, maxValue }) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const cfg = getFaultConfig(label) || { color: "#6366f1" };

  return (
    <div className="mb-3.5">
      <div className="mb-1.5 flex justify-between">
        <span className="text-sm text-slate-300">{label.replace(/_/g, " ")}</span>
        <span className="text-sm font-semibold" style={{ color: cfg.color }}>
          {value.toFixed(2)}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${cfg.color}66, ${cfg.color})`,
          }}
        />
      </div>
    </div>
  );
}

export function ShapBar({ feature, value }) {
  const isPos = value >= 0;
  const color = isPos ? "#818cf8" : "#f43f5e";

  return (
    <div className="mb-2.5">
      <div className="mb-1 flex justify-between">
        <span className="text-xs text-slate-400">{feature.replace(/_/g, " ")}</span>
        <span
          className="font-mono text-xs font-semibold"
          style={{ color }}
        >
          {isPos ? "+" : ""}
          {value.toFixed(4)}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(Math.abs(value) * 300, 100)}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

export function TopFeatureBar({ feature, value, maxValue }) {
  const pct = maxValue > 0 ? (Math.abs(value) / maxValue) * 100 : 0;

  return (
    <div className="mb-2.5">
      <div className="mb-1 flex justify-between">
        <span className="text-xs text-slate-400">{feature.replace(/_/g, " ")}</span>
        <span className="font-mono text-xs font-semibold text-purple-300">
          {value.toFixed(4)}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500"
        />
      </div>
    </div>
  );
}

export function PredictionInsights({ result }) {
  const [showAllShap, setShowAllShap] = useState(false);
  const faultConfig = getFaultConfig(result.prediction);

  const probEntries = Object.entries(result.probabilities || {}).sort(
    (a, b) => b[1] - a[1]
  );
  const maxProb = probEntries.length ? probEntries[0][1] : 1;

  const shapEntries = Object.entries(result.shap_values || {}).sort(
    (a, b) => Math.abs(b[1]) - Math.abs(a[1])
  );
  const visibleShap = showAllShap ? shapEntries : shapEntries.slice(0, 5);

  const topFeatureEntries = Object.entries(result.top_features || {}).sort(
    (a, b) => Math.abs(b[1]) - Math.abs(a[1])
  );
  const maxTopFeature = topFeatureEntries.length
    ? Math.abs(topFeatureEntries[0][1])
    : 1;

  return (
    <div className="space-y-5">
      <div
        className="flex flex-wrap items-center gap-8 rounded-2xl border p-7"
        style={{
          background: faultConfig.bg,
          borderColor: faultConfig.border,
        }}
      >
        <div className="min-w-[190px] flex-1">
          <div className="mb-2 text-4xl">{faultConfig.icon}</div>
          <h2
            className="mb-1.5 text-2xl font-extrabold"
            style={{ color: faultConfig.color }}
          >
            {result.prediction.replace(/_/g, " ")}
          </h2>
          <p className="text-sm text-slate-400">{faultConfig.desc}</p>
        </div>

        <ConfidenceDial confidence={result.confidence} />

        <div className="flex min-w-[150px] flex-col gap-3.5">
          {[
            ["Prediction ID", `#${result.prediction_id}`],
            ["Class Index", result.prediction_class],
            [
              "Timestamp",
              new Date(result.prediction_time).toLocaleString(),
            ],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="mb-0.5 text-[11px] uppercase tracking-wider text-slate-500">
                {label}
              </p>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-200">
                {label === "Timestamp" && <Clock size={11} />}
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-5 flex items-center gap-2">
            <BarChart2 size={15} className="text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Class Probabilities</h3>
          </div>
          {probEntries.map(([label, value]) => (
            <ProbabilityBar
              key={label}
              label={label}
              value={value}
              maxValue={maxProb}
            />
          ))}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-5 flex items-center gap-2">
            <TrendingUp size={15} className="text-indigo-400" />
            <h3 className="text-sm font-bold text-white">
              Feature Influence (SHAP)
            </h3>
          </div>
          {visibleShap.length > 0 ? (
            visibleShap.map(([feature, value]) => (
              <ShapBar key={feature} feature={feature} value={value} />
            ))
          ) : (
            <p className="text-sm text-slate-500">No SHAP values available.</p>
          )}
          {shapEntries.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAllShap((prev) => !prev)}
              className="mt-2 flex items-center gap-1 text-xs text-indigo-400 transition hover:text-indigo-300"
            >
              {showAllShap ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {showAllShap
                ? "Show less"
                : `Show all ${shapEntries.length} features`}
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-5 flex items-center gap-2">
          <Layers size={15} className="text-purple-400" />
          <h3 className="text-sm font-bold text-white">Top Features</h3>
        </div>
        {topFeatureEntries.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
            {topFeatureEntries.map(([feature, value]) => (
              <TopFeatureBar
                key={feature}
                feature={feature}
                value={value}
                maxValue={maxTopFeature}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No top features available.</p>
        )}
      </div>
    </div>
  );
}


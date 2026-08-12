import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getActiveModel,
  getPredictionHistory,
} from "../services/api";
import { formatMetricPercent, withVerifiedMetrics } from "../utils/modelMetrics";

function formatFaultLabel(prediction) {
  return prediction?.replace(/_/g, " ") ?? "";
}

function formatDate(value) {
  if (!value) {
    return "N/A";
  }

  return new Date(value).toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Dashboard() {
  const [model, setModel] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const [modelData, historyData] = await Promise.all([
        getActiveModel(),
        getPredictionHistory(),
      ]);

      setModel(withVerifiedMetrics(modelData));
      setHistory(historyData);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const averageConfidence = useMemo(() => {
    if (history.length === 0) {
      return null;
    }

    const total = history.reduce(
      (sum, item) => sum + Number(item.confidence || 0),
      0
    );

    return (total / history.length).toFixed(1);
  }, [history]);

  const sortedHistory = useMemo(() => {
    return [...history].sort(
      (a, b) => new Date(b.prediction_time) - new Date(a.prediction_time)
    );
  }, [history]);

  const latestPrediction = useMemo(() => {
    return sortedHistory[0] ?? null;
  }, [sortedHistory]);

  const predictionDistribution = useMemo(() => {
    const counts = history.reduce((acc, item) => {
      acc[item.prediction] = (acc[item.prediction] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [history]);

  const maxDistributionCount = useMemo(() => {
    if (predictionDistribution.length === 0) {
      return 0;
    }

    return predictionDistribution[0][1];
  }, [predictionDistribution]);

  const recentPredictions = useMemo(() => {
    return sortedHistory.slice(0, 5);
  }, [sortedHistory]);

  const chartData = useMemo(() => {
    const chronological = [...history]
      .sort(
        (a, b) =>
          new Date(a.prediction_time) - new Date(b.prediction_time)
      )
      .slice(-12);

    if (chronological.length === 0) {
      return {
        points: [],
        linePath: "",
        areaPath: "",
      };
    }

    const width = 720;
    const chartBottom = 208;
    const chartHeight = 160;
    const chartLeft = 32;
    const chartRight = 688;
    const step =
      chronological.length === 1
        ? 0
        : (chartRight - chartLeft) / (chronological.length - 1);

    const points = chronological.map((item, index) => {
      const confidence = Math.min(
        Math.max(Number(item.confidence || 0), 0),
        100
      );

      return {
        ...item,
        x: chronological.length === 1 ? width / 2 : chartLeft + index * step,
        y: chartBottom - (confidence / 100) * chartHeight,
        confidence,
      };
    });

    const linePath = points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ");

    const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartBottom} L ${points[0].x} ${chartBottom} Z`;

    return {
      points,
      linePath,
      areaPath,
    };
  }, [history]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <div className="skeleton h-3 w-32" />
          <div className="skeleton h-12 w-72 max-w-full" />
          <div className="skeleton h-4 w-96 max-w-full" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="glass-card space-y-5 p-5">
              <div className="skeleton h-3 w-28" />
              <div className="skeleton h-10 w-24" />
              <div className="skeleton h-3 w-20" />
            </div>
          ))}
        </div>

        <div className="chart-shell h-80">
          <div className="skeleton h-full w-full" />
        </div>
      </div>
    );
  }

  if (error && !model) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">BearingIQ / System status</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Dashboard
            </h1>
            <p className="mt-3 max-w-xl text-sm text-[var(--text-2)] sm:text-base">
              Your diagnostic command center is waiting for a successful data sync.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadDashboard()}
            className="btn-primary"
          >
            Retry sync <span aria-hidden="true">↗</span>
          </button>
        </div>

        <div className="glass-card border-red-400/30 bg-red-500/[0.08] p-5 text-red-300">
          <div className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-400" />
            <div>
              <p className="font-semibold text-red-200">
                Unable to load dashboard data
              </p>
              <p className="mt-1 text-sm text-red-300/80">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.025] px-5 py-7 shadow-2xl shadow-black/20 sm:px-8 sm:py-9">
        <div className="absolute -right-20 -top-32 h-72 w-72 rounded-full bg-orange-500/10 blur-[90px]" />
        <div className="absolute bottom-0 right-1/4 h-28 w-28 rounded-full bg-cyan-300/10 blur-[70px]" />

        <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="eyebrow">BearingIQ / Command center</p>
              <span className="status-live">Telemetry ready</span>
            </div>

            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[0.98] tracking-[-0.07em] text-white sm:text-6xl">
              See the signal before it becomes a failure.
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--text-2)] sm:text-base">
              Bearing fault diagnosis analytics, model health, and prediction history in one focused workspace.
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-3 sm:flex-row sm:items-center">
            <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[var(--text-3)]">
              {history.length} signal{history.length === 1 ? "" : "s"} indexed
            </span>

            <button
              type="button"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
              className="btn-primary disabled:cursor-wait disabled:opacity-60"
            >
              <span className={refreshing ? "animate-spin" : ""}>↻</span>
              {refreshing ? "Syncing..." : "Refresh data"}
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="glass-card border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm text-amber-200">
          <span className="mr-2 text-amber-300">●</span>
          {error} Data shown below is from the last successful sync.
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="metric-card reveal-up">
          <p className="metric-label">Total predictions</p>
          <p className="metric-value">{history.length}</p>
          <p className="metric-delta-neutral">Historical observations</p>
        </div>

        <div className="metric-card reveal-up">
          <p className="metric-label">Average confidence</p>
          <p className="metric-value text-[var(--cyan)]">
            {averageConfidence !== null ? `${averageConfidence}%` : "N/A"}
          </p>
          <p className="metric-delta-up">Model certainty index</p>
        </div>

        <div className="metric-card reveal-up">
          <p className="metric-label">Latest diagnosis</p>
          <p className="mt-3 max-w-full truncate text-xl font-semibold tracking-tight text-white sm:text-2xl">
            {latestPrediction
              ? formatFaultLabel(latestPrediction.prediction)
              : "No predictions yet"}
          </p>
          <p className="metric-delta-neutral">
            {latestPrediction
              ? formatDate(latestPrediction.prediction_time)
              : "Awaiting first signal"}
          </p>
        </div>

        <div className="metric-card reveal-up">
          <p className="metric-label">Active model</p>
          <p className="mt-3 truncate text-xl font-semibold tracking-tight text-[var(--accent-bright)] sm:text-2xl">
            {model?.model_name ?? "N/A"}
          </p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="truncate font-mono text-[0.68rem] uppercase tracking-wider text-[var(--text-2)]">
              {model?.algorithm ?? "N/A"}
            </span>
            <span
              className={
                model?.is_active
                  ? "status-live"
                  : "status-live status-warning"
              }
            >
              {model?.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </section>

      <section className="chart-shell">
        <div className="relative z-[1] flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="eyebrow">Live diagnostic feed</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Confidence trend
            </h2>
            <p className="mt-2 text-sm text-[var(--text-2)]">
              Latest {Math.min(history.length, 12)} prediction confidence values over time.
            </p>
          </div>

          <div className="glass-subtle flex items-center gap-3 px-4 py-3">
            <span className="dot-pulse" />
            <div>
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--text-3)]">
                Current average
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                {averageConfidence !== null ? `${averageConfidence}%` : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {chartData.points.length === 0 ? (
          <div className="relative z-[1] mt-8 flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.12] bg-black/20 p-8 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-300/20 bg-orange-400/10 text-2xl text-[var(--accent-bright)]">
              ∿
            </div>
            <h3 className="text-lg font-semibold text-white">
              No signal history yet
            </h3>
            <p className="mt-2 max-w-md text-sm text-[var(--text-2)]">
              Run a bearing analysis from the Prediction page to populate the animated confidence graph.
            </p>
            <Link to="/prediction" className="btn-secondary mt-5">
              Go to Prediction <span aria-hidden="true">→</span>
            </Link>
          </div>
        ) : (
          <div className="relative z-[1] mt-7 overflow-hidden rounded-2xl border border-white/[0.07] bg-black/20 p-2 sm:p-4">
            <svg
              viewBox="0 0 720 240"
              role="img"
              aria-label="Prediction confidence trend chart"
              className="chart-grid h-64 w-full overflow-visible rounded-xl"
            >
              <defs>
                <linearGradient
                  id="bearing-area-gradient"
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#ff935f" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#ff6b35" stopOpacity="0" />
                </linearGradient>
              </defs>

              <line x1="32" y1="48" x2="688" y2="48" stroke="rgba(255,255,255,0.08)" />
              <line x1="32" y1="128" x2="688" y2="128" stroke="rgba(255,255,255,0.08)" />
              <line x1="32" y1="208" x2="688" y2="208" stroke="rgba(255,255,255,0.08)" />

              <text x="0" y="53" className="chart-label" fill="rgba(255,255,255,0.45)" fontSize="10">
                100
              </text>
              <text x="7" y="133" className="chart-label" fill="rgba(255,255,255,0.45)" fontSize="10">
                50
              </text>
              <text x="15" y="213" className="chart-label" fill="rgba(255,255,255,0.45)" fontSize="10">
                0
              </text>

              <path d={chartData.areaPath} className="chart-area" />
              <path d={chartData.linePath} className="chart-line" />

              {chartData.points.map((point) => (
                <g key={`${point.prediction_id}-${point.prediction_time}`}>
                  <circle cx={point.x} cy={point.y} r="5" className="chart-point" />
                  <title>
                    {formatFaultLabel(point.prediction)} — {point.confidence}%
                  </title>
                </g>
              ))}
            </svg>

            <div className="mt-2 flex items-center justify-between px-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--text-3)]">
              <span>Earlier signals</span>
              <span>Most recent</span>
            </div>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-card p-5 sm:p-7">
          <div className="mb-7 flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Failure taxonomy</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                Prediction distribution
              </h2>
            </div>
            <span className="glass-subtle px-3 py-2 font-mono text-[0.64rem] uppercase tracking-wider text-[var(--text-2)]">
              {predictionDistribution.length} classes
            </span>
          </div>

          {history.length === 0 ? (
            <div className="glass-subtle p-7 text-center">
              <h3 className="text-lg font-semibold text-white">
                No predictions yet
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text-2)]">
                Run a bearing analysis from the Prediction page to see the class distribution.
              </p>
              <Link to="/prediction" className="btn-primary mt-5">
                Go to Prediction <span aria-hidden="true">→</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {predictionDistribution.map(([label, count], index) => {
                const width =
                  maxDistributionCount > 0
                    ? (count / maxDistributionCount) * 100
                    : 0;
                const percentage = ((count / history.length) * 100).toFixed(0);

                return (
                  <div key={label} className="group">
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="font-mono text-[0.62rem] text-[var(--text-3)]">
                          0{index + 1}
                        </span>
                        <span className="truncate text-sm font-medium capitalize text-[var(--text-1)] group-hover:text-white">
                          {formatFaultLabel(label)}
                        </span>
                      </div>
                      <span className="shrink-0 font-mono text-xs text-white">
                        {count} <span className="text-[var(--text-3)]">/ {percentage}%</span>
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[var(--accent-strong)] via-[var(--accent-bright)] to-[var(--lime)] shadow-[0_0_18px_rgba(255,107,53,0.35)] transition-all duration-700 ease-out"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="glass-card overflow-hidden p-5 sm:p-7">
          <div className="mb-7 flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Model intelligence</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                Active model details
              </h2>
            </div>
            <span
              className={
                model?.is_active
                  ? "status-live"
                  : "status-live status-warning"
              }
            >
              {model?.is_active ? "Operational" : "Offline"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              ["Model", model?.model_name ?? "N/A"],
              ["Algorithm", model?.algorithm ?? "N/A"],
              ["Accuracy", formatMetricPercent(model?.accuracy)],
              ["Version", model?.version ?? "N/A"],
              ["F1 score", formatMetricPercent(model?.f1_score)],
              ["Precision", formatMetricPercent(model?.precision_score)],
              ["Recall", formatMetricPercent(model?.recall_score)],
              ["Cross validation", formatMetricPercent(model?.cross_validation_accuracy)],
              ["Status", model?.is_active ? "Active" : "Inactive"],
            ].map(([label, value]) => (
              <div key={label} className="glass-subtle min-w-0 p-4">
                <p className="metric-label truncate">{label}</p>
                <p className="mt-2 truncate text-sm font-semibold capitalize text-white">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="glass-card overflow-hidden p-5 sm:p-7">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Recent signal log</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              Recent predictions
            </h2>
          </div>
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-[var(--text-3)]">
            Showing latest {recentPredictions.length}
          </span>
        </div>

        {recentPredictions.length === 0 ? (
          <div className="glass-subtle p-8 text-center">
            <h3 className="text-lg font-semibold text-white">
              No predictions yet
            </h3>
            <p className="mt-2 text-sm text-[var(--text-2)]">
              Run a bearing analysis from the Prediction page to see results here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/[0.07]">
            <table className="w-full min-w-[720px] border-collapse">
              <thead className="bg-white/[0.035]">
                <tr className="border-b border-white/[0.08]">
                  <th className="px-5 py-4 text-left font-mono text-[0.65rem] font-normal uppercase tracking-[0.14em] text-[var(--text-3)]">
                    Prediction ID
                  </th>
                  <th className="px-5 py-4 text-left font-mono text-[0.65rem] font-normal uppercase tracking-[0.14em] text-[var(--text-3)]">
                    Diagnosis
                  </th>
                  <th className="px-5 py-4 text-left font-mono text-[0.65rem] font-normal uppercase tracking-[0.14em] text-[var(--text-3)]">
                    Confidence
                  </th>
                  <th className="px-5 py-4 text-left font-mono text-[0.65rem] font-normal uppercase tracking-[0.14em] text-[var(--text-3)]">
                    Date &amp; time
n                  </th>
                </tr>
              </thead>
              <tbody>
                {recentPredictions.map((item) => (
                  <tr
                    key={item.prediction_id}
                    className="group border-b border-white/[0.06] transition-colors last:border-0 hover:bg-orange-400/[0.05]"
                  >
                    <td className="px-5 py-4 font-mono text-sm text-[var(--accent-bright)]">
                      #{item.prediction_id}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium capitalize text-white">
                      {formatFaultLabel(item.prediction)}
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--text-1)]">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)] shadow-[0_0_10px_rgba(125,231,219,0.7)]" />
                        {item.confidence}%
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--text-2)]">
                      {formatDate(item.prediction_time)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;

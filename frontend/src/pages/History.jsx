import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  History as HistoryIcon,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Search,
  Eye,
  Inbox,
  X,
  SlidersHorizontal,
  ArrowUpRight,
} from "lucide-react";
import {
  getPredictionHistory,
  clearPredictionHistory,
} from "../services/api";
import { getFaultConfig, formatFaultLabel } from "../utils/faultConfig";

function ConfirmDialog({ open, onConfirm, onCancel, loading }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        className="glass-strong w-full max-w-md p-6 sm:p-7"
      >
        <div className="mb-7 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-red-300/20 bg-red-400/10 text-red-300">
            <AlertTriangle size={20} />
          </div>

          <div>
            <p className="eyebrow text-red-300">Destructive action</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">
              Clear all history?
            </h3>
            <p className="mt-2 text-sm leading-6 text-white/45">
              This will permanently delete all prediction records. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex min-h-[2.8rem] items-center justify-center gap-2 rounded-full border border-red-300/40 bg-red-400/15 px-5 py-2.5 text-sm font-semibold text-red-200 transition hover:border-red-300/70 hover:bg-red-400/25 disabled:cursor-wait disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200/30 border-t-red-200" />
                Clearing...
              </>
            ) : (
              <>
                <Trash2 size={14} />
                Clear all
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ConfidenceBadge({ confidence }) {
  const numericConfidence = Number(confidence || 0);
  const color =
    numericConfidence >= 80
      ? "text-emerald-300"
      : numericConfidence >= 55
      ? "text-amber-300"
      : "text-rose-300";

  return (
    <span className={`inline-flex items-center gap-2 font-mono text-sm font-semibold ${color}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_10px_currentColor]" />
      {numericConfidence.toFixed(1)}%
    </span>
  );
}

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [showConfirm, setShowConfirm] = useState(false);

  const loadHistory = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await getPredictionHistory();
      setHistory(response);
    } catch (err) {
      setError(err.message || "Failed to load prediction history.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const filteredHistory = useMemo(() => {
    let data = [...history];

    if (search.trim() !== "") {
      const query = search.toLowerCase();

      data = data.filter(
        (item) =>
          item.prediction.toLowerCase().includes(query) ||
          String(item.prediction_id).includes(query)
      );
    }

    data.sort((a, b) => {
      const timeA = new Date(a.prediction_time);
      const timeB = new Date(b.prediction_time);

      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });

    return data;
  }, [history, search, sortOrder]);

  const faultDistribution = useMemo(() => {
    const counts = history.reduce((accumulator, item) => {
      accumulator[item.prediction] = (accumulator[item.prediction] || 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [history]);

  const highConfidenceCount = useMemo(() => {
    return history.filter((item) => Number(item.confidence || 0) >= 80).length;
  }, [history]);

  const maxFaultCount = faultDistribution[0]?.[1] || 1;

  async function handleClearHistory() {
    setClearing(true);
    setError("");

    try {
      await clearPredictionHistory();
      setHistory([]);
      setShowConfirm(false);
    } catch (err) {
      setError(err.message || "Failed to clear prediction history.");
    } finally {
      setClearing(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <div className="skeleton h-3 w-40" />
          <div className="skeleton h-12 w-80 max-w-full" />
          <div className="skeleton h-4 w-[28rem] max-w-full" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="glass-card space-y-5 p-5">
              <div className="skeleton h-3 w-28" />
              <div className="skeleton h-10 w-24" />
            </div>
          ))}
        </div>

        <div className="glass-card space-y-4 p-6">
          <div className="skeleton h-11 w-full" />
          <div className="skeleton h-12 w-full" />
          <div className="skeleton h-12 w-full" />
          <div className="skeleton h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.025] px-5 py-7 shadow-2xl shadow-black/20 sm:px-8 sm:py-9"
      >
        <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-orange-500/10 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-cyan-300/10 blur-[65px]" />

        <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="eyebrow">BearingIQ / Signal archive</p>
              <span className="status-live">Archive online</span>
            </div>

            <h1 className="mt-4 text-4xl font-semibold leading-[0.98] tracking-[-0.07em] text-white sm:text-6xl">
              Your prediction history.
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--text-2)] sm:text-base">
              Review every diagnostic signal, compare confidence, and trace each model verdict back to its source.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => loadHistory(true)}
              disabled={refreshing}
              className="btn-secondary disabled:cursor-wait disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin text-[var(--accent-bright)]" : "text-[var(--accent-bright)]"}
              />
              {refreshing ? "Syncing..." : "Refresh history"}
            </button>

            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              disabled={history.length === 0}
              className="inline-flex min-h-[2.8rem] items-center justify-center gap-2 rounded-full border border-red-300/25 bg-red-400/[0.08] px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:border-red-300/50 hover:bg-red-400/[0.15] disabled:cursor-not-allowed disabled:opacity-35"
            >
              <Trash2 size={15} />
              Clear archive
            </button>
          </div>
        </div>
      </motion.section>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass-card flex items-center gap-3 border-red-300/25 bg-red-400/[0.08] p-4"
          >
            <AlertTriangle size={18} className="shrink-0 text-red-300" />
            <p className="flex-1 text-sm text-red-200">{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              className="text-red-300 transition hover:text-white"
              aria-label="Dismiss error"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary metrics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="metric-card reveal-up">
          <p className="metric-label">Total records</p>
          <p className="metric-value">{history.length}</p>
          <p className="metric-delta-neutral">All indexed signals</p>
        </div>

        <div className="metric-card reveal-up">
          <p className="metric-label">Filtered results</p>
          <p className="metric-value text-[var(--cyan)]">{filteredHistory.length}</p>
          <p className="metric-delta-neutral">
            {search.trim() ? `Matching “${search}”` : "Current archive view"}
          </p>
        </div>

        <div className="metric-card reveal-up">
          <p className="metric-label">High confidence</p>
          <p className="metric-value text-emerald-300">{highConfidenceCount}</p>
          <p className="metric-delta-up">80% confidence or higher</p>
        </div>
      </section>

      {/* Search and filters */}
      <section className="glass-card p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
            />
            <input
              type="text"
              placeholder="Search by fault type or prediction ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-xl border border-white/[0.09] bg-black/25 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-orange-300/45 focus:bg-orange-400/[0.04] focus:ring-2 focus:ring-orange-400/10"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-white/30 transition hover:bg-white/10 hover:text-white"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-[var(--accent-bright)]">
              <SlidersHorizontal size={16} />
            </div>
            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              className="rounded-xl border border-white/[0.09] bg-[#111113] px-4 py-3 text-sm text-white/75 outline-none transition focus:border-orange-300/45 focus:ring-2 focus:ring-orange-400/10"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>
      </section>

      {/* Distribution */}
      {history.length > 0 && (
        <section className="glass-card p-5 sm:p-7">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Fault taxonomy</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                Archive distribution
              </h2>
            </div>
            <p className="font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[var(--text-3)]">
              {faultDistribution.length} classes detected
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {faultDistribution.map(([label, count], index) => {
              const percentage = (count / history.length) * 100;
              const faultConfig = getFaultConfig(label);

              return (
                <div key={label} className="glass-subtle p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="font-mono text-[0.62rem] text-[var(--text-3)]">
                        0{index + 1}
                      </span>
                      <span className="truncate text-sm font-medium capitalize text-white/75">
                        {formatFaultLabel(label)}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-white/65">
                      {count} / {percentage.toFixed(0)}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxFaultCount) * 100}%` }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{
                        background: faultConfig?.color
                          ? `linear-gradient(90deg, ${faultConfig.color}88, ${faultConfig.color})`
                          : "linear-gradient(90deg, #ff6b35, #d7f36b)",
                        boxShadow: faultConfig?.color
                          ? `0 0 16px ${faultConfig.color}55`
                          : "0 0 16px rgba(255,107,53,0.35)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* History table */}
      <section className="glass-card overflow-hidden">
        <div className="flex flex-col justify-between gap-3 border-b border-white/[0.07] px-5 py-5 sm:flex-row sm:items-end sm:px-7">
          <div>
            <p className="eyebrow">Chronological signal log</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              Prediction records
            </h2>
          </div>
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-[var(--text-3)]">
            {filteredHistory.length} visible
          </span>
        </div>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-300/15 bg-orange-400/[0.08] text-[var(--accent-bright)]">
              <Inbox size={28} />
            </div>
            <h3 className="text-xl font-semibold text-white">No predictions yet</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--text-2)]">
              Run your first bearing fault prediction to start building your diagnostic archive.
            </p>
            <Link to="/prediction" className="btn-primary mt-6">
              Go to Prediction <ArrowUpRight size={15} />
            </Link>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <Search size={30} className="mb-4 text-white/25" />
            <h3 className="text-xl font-semibold text-white">No matching results</h3>
            <p className="mt-2 text-sm text-[var(--text-2)]">
              Try a different fault type or prediction ID.
            </p>
            <button type="button" onClick={() => setSearch("")} className="btn-secondary mt-6">
              Clear search
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead className="bg-black/20">
                <tr className="border-b border-white/[0.07]">
                  <th className="px-6 py-4 text-left font-mono text-[0.65rem] font-normal uppercase tracking-[0.14em] text-[var(--text-3)]">
                    Prediction ID
                  </th>
                  <th className="px-6 py-4 text-left font-mono text-[0.65rem] font-normal uppercase tracking-[0.14em] text-[var(--text-3)]">
                    Predicted fault
                  </th>
                  <th className="px-6 py-4 text-left font-mono text-[0.65rem] font-normal uppercase tracking-[0.14em] text-[var(--text-3)]">
                    Confidence
                  </th>
                  <th className="px-6 py-4 text-left font-mono text-[0.65rem] font-normal uppercase tracking-[0.14em] text-[var(--text-3)]">
                    Date &amp; time
                  </th>
                  <th className="px-6 py-4 text-right font-mono text-[0.65rem] font-normal uppercase tracking-[0.14em] text-[var(--text-3)]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredHistory.map((item) => {
                  const faultConfig = getFaultConfig(item.prediction);

                  return (
                    <motion.tr
                      layout
                      key={item.prediction_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group border-b border-white/[0.06] transition-colors last:border-0 hover:bg-orange-400/[0.045]"
                    >
                      <td className="px-6 py-5">
                        <span className="font-mono text-sm font-medium text-[var(--accent-bright)]">
                          #{item.prediction_id}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${faultConfig?.badge || "border-white/10 bg-white/5 text-white/70"}`}
                        >
                          {formatFaultLabel(item.prediction)}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <ConfidenceBadge confidence={item.confidence} />
                      </td>

                      <td className="px-6 py-5 text-sm text-[var(--text-2)]">
                        {new Date(item.prediction_time).toLocaleString()}
                      </td>

                      <td className="px-6 py-5 text-right">
                        <Link
                          to={`/prediction/${item.prediction_id}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.035] px-3 py-2 text-xs font-semibold text-white/65 transition hover:border-orange-300/40 hover:bg-orange-400/[0.1] hover:text-[var(--accent-bright)]"
                        >
                          <Eye size={14} />
                          View details
                          <ArrowUpRight size={13} />
                        </Link>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AnimatePresence>
        {showConfirm && (
          <ConfirmDialog
            open={showConfirm}
            onConfirm={handleClearHistory}
            onCancel={() => setShowConfirm(false)}
            loading={clearing}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default History;

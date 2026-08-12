import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  FileText,
  X,
  Zap,
  CheckCircle2,
  AlertTriangle,
  BarChart2,
  Cpu,
  Clock,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  PenLine,
  Info,
} from "lucide-react";
import { predictBearing, predictRandomBearing } from "../services/api";

const TIME_DOMAIN = [
  { key: "Mean", label: "Mean", tip: "Average amplitude of the vibration signal" },
  { key: "Standard_Deviation", label: "Std Deviation", tip: "Spread / fluctuation in the signal amplitude" },
  { key: "RMS", label: "RMS", tip: "Root Mean Square — overall energy of the signal" },
  { key: "Maximum", label: "Maximum", tip: "Peak positive value in the signal" },
  { key: "Minimum", label: "Minimum", tip: "Peak negative value in the signal" },
  { key: "Peak_to_Peak", label: "Peak to Peak", tip: "Total amplitude swing = Maximum − Minimum" },
  { key: "Skewness", label: "Skewness", tip: "Asymmetry of the signal distribution" },
  { key: "Kurtosis", label: "Kurtosis", tip: "Sharpness of impulse peaks — key fault indicator" },
  { key: "Crest_Factor", label: "Crest Factor", tip: "Peak ÷ RMS — detects sudden spikes" },
  { key: "Shape_Factor", label: "Shape Factor", tip: "RMS ÷ Mean Absolute Value" },
  { key: "Impulse_Factor", label: "Impulse Factor", tip: "Peak ÷ Mean Absolute Value" },
  { key: "Clearance_Factor", label: "Clearance Factor", tip: "Peak ÷ (√Mean Absolute Value)²" },
];

const FREQ_DOMAIN = [
  { key: "Dominant_Frequency", label: "Dominant Frequency", tip: "Strongest frequency component (Hz)" },
  { key: "Maximum_FFT_Magnitude", label: "Max FFT Magnitude", tip: "Amplitude at the dominant frequency" },
  { key: "Spectral_Energy", label: "Spectral Energy", tip: "Total energy across all frequencies" },
  { key: "Mean_Frequency", label: "Mean Frequency", tip: "Weighted average frequency (Hz)" },
  { key: "Spectral_Entropy", label: "Spectral Entropy", tip: "Randomness of frequency distribution" },
];

const ALL_FEATURES = [...TIME_DOMAIN, ...FREQ_DOMAIN];
const EMPTY_FEATURES = Object.fromEntries(
  ALL_FEATURES.map((feature) => [feature.key, ""])
);

const FAULT_CONFIG = {
  Normal: {
    color: "#86efac",
    bg: "rgba(34,197,94,0.09)",
    border: "rgba(134,239,172,0.3)",
    icon: "✅",
    desc: "Bearing is operating normally. No fault detected.",
  },
  Ball: {
    color: "#fbbf24",
    bg: "rgba(245,158,11,0.09)",
    border: "rgba(251,191,36,0.3)",
    icon: "⚠️",
    desc: "Ball fault detected. Inspect rolling elements for wear or pitting.",
  },
  Inner_Race: {
    color: "#fb7185",
    bg: "rgba(239,68,68,0.09)",
    border: "rgba(251,113,133,0.3)",
    icon: "🔴",
    desc: "Inner race fault detected. Check shaft and inner ring surface.",
  },
  Outer_Race: {
    color: "#c084fc",
    bg: "rgba(168,85,247,0.09)",
    border: "rgba(192,132,252,0.3)",
    icon: "🟣",
    desc: "Outer race fault detected. Inspect bearing housing and outer ring.",
  },
};

function getFaultConfig(prediction) {
  if (!prediction) return null;

  const normalizedPrediction = prediction.replace(" ", "_");

  return (
    FAULT_CONFIG[normalizedPrediction] ||
    FAULT_CONFIG[prediction] || {
      color: "#a5b4fc",
      bg: "rgba(99,102,241,0.1)",
      border: "rgba(165,180,252,0.3)",
      icon: "🔵",
      desc: "Classification complete.",
    }
  );
}

const REQUIRED_KEYS = ALL_FEATURES.map((feature) => feature.key);

function isRandomDemoCSV(fileName, text) {
  const normalizedName = fileName.trim().toLowerCase();

  if (normalizedName.includes("random_demo") && normalizedName.endsWith(".csv")) {
    return true;
  }

  const lines = text.trim().split(/\r?\n/);

  if (lines.length < 2) {
    return false;
  }

  const headers = lines[0].split(",").map((header) => header.trim());
  const values = lines[1].split(",").map((value) => value.trim());

  return headers[0] === "Mode" && values[0]?.toUpperCase() === "RANDOM";
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);

  if (lines.length < 2) {
    throw new Error("CSV must have a header row and at least one data row.");
  }

  const headers = lines[0].split(",").map((header) => header.trim());
  const values = lines[1].split(",").map((value) => value.trim());
  const row = {};

  headers.forEach((header, index) => {
    row[header] = values[index];
  });

  const missing = REQUIRED_KEYS.filter((feature) => !(feature in row));

  if (missing.length) {
    throw new Error(`Missing columns: ${missing.join(", ")}`);
  }

  const features = {};

  REQUIRED_KEYS.forEach((feature) => {
    const value = parseFloat(row[feature]);

    if (Number.isNaN(value)) {
      throw new Error(`Invalid value for "${feature}": "${row[feature]}"`);
    }

    features[feature] = String(value);
  });

  return features;
}

function Tooltip({ text }) {
  const [show, setShow] = useState(false);

  return (
    <span className="relative inline-flex items-center">
      <Info
        size={13}
        className="ml-1 cursor-help text-white/25 transition-colors hover:text-[var(--accent-bright)]"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      />

      <AnimatePresence>
        {show && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="pointer-events-none absolute bottom-[calc(100%+0.5rem)] left-1/2 z-50 w-max max-w-[18rem] -translate-x-1/2 rounded-xl border border-white/[0.12] bg-[#111113]/95 px-3 py-2 text-xs normal-case tracking-normal text-white/75 shadow-2xl shadow-black/40 backdrop-blur-xl"
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

function FeatureInput({ feature, value, onChange, required = true }) {
  const hasValue = value !== "" && !Number.isNaN(Number(value));

  return (
    <label className="group block">
      <span className="mb-2 flex items-center font-mono text-[0.65rem] uppercase tracking-[0.1em] text-white/45 transition-colors group-focus-within:text-[var(--accent-bright)]">
        {feature.label}
        <Tooltip text={feature.tip} />
      </span>

      <input
        type="number"
        step="any"
        name={feature.key}
        value={value}
        onChange={onChange}
        placeholder="0.000000"
        className={`w-full rounded-xl border px-3 py-3 font-mono text-sm outline-none transition-all duration-300 placeholder:text-white/20 focus:ring-2 focus:ring-orange-400/20 ${
          hasValue
            ? "border-orange-300/35 bg-orange-400/[0.07] text-white shadow-[0_0_22px_rgba(255,107,53,0.07)]"
            : "border-white/[0.09] bg-white/[0.035] text-white/80 hover:border-white/20 hover:bg-white/[0.055]"
        }`}
        required={required}
      />
    </label>
  );
}

function ConfidenceDial({ confidence }) {
  const percentage = Math.min(Math.max(Number(confidence || 0), 0), 100);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color = percentage >= 80 ? "#86efac" : percentage >= 55 ? "#fbbf24" : "#fb7185";

  return (
    <div className="relative shrink-0">
      <svg width="150" height="150" viewBox="0 0 150 150">
        <circle
          cx="75"
          cy="75"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="10"
        />
        <circle
          cx="75"
          cy="75"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 75 75)"
          style={{
            transition: "stroke-dashoffset 1s ease, stroke 0.5s ease",
            filter: `drop-shadow(0 0 8px ${color}88)`,
          }}
        />
        <text
          x="75"
          y="71"
          textAnchor="middle"
          fill={color}
          fontSize="22"
          fontWeight="700"
          fontFamily="DM Mono, monospace"
        >
          {percentage.toFixed(1)}%
        </text>
        <text
          x="75"
          y="90"
          textAnchor="middle"
          fill="rgba(255,255,255,0.4)"
          fontSize="10"
          fontFamily="DM Mono, monospace"
          letterSpacing="1"
        >
          CONFIDENCE
        </text>
      </svg>
    </div>
  );
}

function ProbabilityBar({ label, value, maxValue }) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const config = getFaultConfig(label) || { color: "#a5b4fc" };

  return (
    <div className="mb-5 last:mb-0">
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="text-sm capitalize text-white/70">
          {label.replace(/_/g, " ")}
        </span>
        <span className="font-mono text-sm font-semibold" style={{ color: config.color }}>
          {Number(value).toFixed(2)}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${config.color}66, ${config.color})`,
            boxShadow: `0 0 18px ${config.color}55`,
          }}
        />
      </div>
    </div>
  );
}

function ShapBar({ feature, value }) {
  const isPositive = value >= 0;
  const color = isPositive ? "#a5b4fc" : "#fb7185";
  const width = Math.min(Math.abs(value) * 300, 100);

  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="truncate text-xs capitalize text-white/60">
          {feature.replace(/_/g, " ")}
        </span>
        <span className="shrink-0 font-mono text-xs font-semibold" style={{ color }}>
          {isPositive ? "+" : ""}
          {Number(value).toFixed(4)}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: color, boxShadow: `0 0 12px ${color}66` }}
        />
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, icon }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-orange-300/15 bg-orange-400/[0.08] text-[var(--accent-bright)]">
        {icon}
      </span>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">{title}</h2>
      </div>
    </div>
  );
}

export default function Prediction() {
  const [activeTab, setActiveTab] = useState("manual");
  const [features, setFeatures] = useState(EMPTY_FEATURES);

  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parseError, setParseError] = useState("");
  const [parseOk, setParseOk] = useState(false);
  const [randomDemoMode, setRandomDemoMode] = useState(false);
  const inputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [result, setResult] = useState(null);
  const [showAllShap, setShowAllShap] = useState(false);

  function handleFeatureChange(event) {
    setFeatures((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
    setResult(null);
  }

  function clearResult() {
    setResult(null);
    setApiError("");
  }

  function processFile(selectedFile) {
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      setParseError("Please upload a .csv file.");
      return;
    }

    setFile(selectedFile);
    setParseError("");
    setParseOk(false);
    setRandomDemoMode(false);
    clearResult();

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target.result;

        if (isRandomDemoCSV(selectedFile.name, text)) {
          setRandomDemoMode(true);
          setFeatures(EMPTY_FEATURES);
          setParseOk(true);
          setActiveTab("csv");
          return;
        }

        const parsed = parseCSV(text);
        setRandomDemoMode(false);
        setFeatures(parsed);
        setParseOk(true);
        setActiveTab("manual");
      } catch (err) {
        setParseError(err.message);
      }
    };

    reader.readAsText(selectedFile);
  }

  const onDrop = useCallback((event) => {
    event.preventDefault();
    setIsDragging(false);
    processFile(event.dataTransfer.files[0]);
  }, []);

  function clearFile() {
    setFile(null);
    setParseError("");
    setParseOk(false);
    setRandomDemoMode(false);
    setFeatures(EMPTY_FEATURES);
    clearResult();

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  const filledCount = Object.values(features).filter((value) => value !== "").length;
  const allFilled = filledCount === ALL_FEATURES.length;
  const canPredict = allFilled || randomDemoMode;

  async function handlePredict(event) {
    event?.preventDefault();

    if (!canPredict) return;

    setLoading(true);
    setApiError("");
    setResult(null);

    try {
      const response = randomDemoMode
        ? await predictRandomBearing()
        : await predictBearing({
            features: Object.fromEntries(
              Object.entries(features).map(([key, value]) => [key, parseFloat(value)])
            ),
          });
      setResult(response);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const faultConfig = result ? getFaultConfig(result.prediction) : null;
  const probEntries = result
    ? Object.entries(result.probabilities).sort((a, b) => b[1] - a[1])
    : [];
  const maxProb = probEntries.length ? probEntries[0][1] : 1;
  const shapEntries = result
    ? Object.entries(result.shap_values).sort(
        (a, b) => Math.abs(b[1]) - Math.abs(a[1])
      )
    : [];
  const visibleShap = showAllShap ? shapEntries : shapEntries.slice(0, 5);

  const tabClass = (id) =>
    `flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition-all duration-300 ${
      activeTab === id
        ? "border-orange-300/30 bg-orange-400/[0.12] text-[var(--accent-bright)] shadow-[0_0_24px_rgba(255,107,53,0.08)]"
        : "border-transparent text-white/40 hover:bg-white/[0.05] hover:text-white/75"
    }`;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 pb-10">
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.025] px-5 py-7 shadow-2xl shadow-black/20 sm:px-8 sm:py-9"
      >
        <div className="absolute -right-20 -top-32 h-72 w-72 rounded-full bg-orange-500/10 blur-[90px]" />
        <div className="absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-cyan-300/10 blur-[60px]" />

        <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="eyebrow">BearingIQ / Diagnostic lab</p>
              <span className="status-live">Inference ready</span>
            </div>

            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[0.98] tracking-[-0.07em] text-white sm:text-6xl">
              Read the machine's hidden signature.
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--text-2)] sm:text-base">
              Feed BearingIQ a vibration profile manually or load a feature CSV to classify bearing health with an explainable AI result.
            </p>
          </div>

          <div className="glass-subtle flex shrink-0 items-center gap-3 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-400/10 text-[var(--accent-bright)]">
              <Cpu size={18} />
            </div>
            <div>
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--text-3)]">
                Feature vector
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                {filledCount} / {ALL_FEATURES.length} loaded
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="glass-strong overflow-hidden p-4 sm:p-7"
      >
        <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Input protocol</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              Build a diagnostic profile
            </h2>
          </div>
          <p className="font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[var(--text-3)]">
            17 required signals
          </p>
        </div>

        <div className="mb-7 flex gap-2 rounded-2xl border border-white/[0.07] bg-black/20 p-1.5" role="tablist" aria-label="Prediction input mode">
          <button
            type="button"
            className={tabClass("manual")}
            onClick={() => setActiveTab("manual")}
            role="tab"
            aria-selected={activeTab === "manual"}
          >
            <PenLine size={15} />
            Manual input
          </button>
          <button
            type="button"
            className={tabClass("csv")}
            onClick={() => setActiveTab("csv")}
            role="tab"
            aria-selected={activeTab === "csv"}
          >
            <UploadCloud size={15} />
            Upload CSV
            {parseOk && <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(134,239,172,0.8)]" />}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "csv" && (
            <motion.div
              key="csv"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div
                onDrop={onDrop}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => !file && inputRef.current?.click()}
                className={`relative overflow-hidden rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 sm:p-14 ${
                  isDragging
                    ? "border-orange-300/80 bg-orange-400/[0.1] shadow-[0_0_40px_rgba(255,107,53,0.12)]"
                    : file
                    ? "border-cyan-300/35 bg-cyan-300/[0.04]"
                    : "border-white/[0.12] bg-white/[0.02] hover:border-orange-300/45 hover:bg-orange-400/[0.04]"
                } ${file ? "cursor-default" : "cursor-pointer"}`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(event) => processFile(event.target.files[0])}
                />

                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,107,53,0.08),transparent_42%)]" />

                <AnimatePresence mode="wait">
                  {!file ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative"
                    >
                      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-300/20 bg-orange-400/[0.08] text-[var(--accent-bright)]">
                        <UploadCloud size={30} />
                      </div>
                      <p className="text-base font-semibold text-white/80">
                        Drop a feature vector CSV here
                      </p>
                      <p className="mt-2 text-sm text-white/35">
                        or <span className="text-[var(--accent-bright)]">click to browse</span> — requires all 17 feature columns
                      </p>
                      <p className="mt-4 text-sm text-white/45">
                        Want varied predictions?{" "}
                        <a
                          href="/random_demo.csv"
                          download="random_demo.csv"
                          className="text-[var(--accent-bright)] underline-offset-2 hover:underline"
                          onClick={(event) => event.stopPropagation()}
                        >
                          Download random_demo.csv
                        </a>
                        {" "}and upload it — each run picks a new random sample.
                      </p>
                      <p className="mt-5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--text-3)]">
                        One header row · one data row
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="file"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative flex flex-wrap items-center justify-center gap-4"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-300/10 text-[var(--cyan)]">
                        <FileText size={26} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-white">{file.name}</p>
                        <p className="mt-1 font-mono text-xs text-white/35">
                          {(file.size / 1024).toFixed(1)} KB ·{" "}
                          {randomDemoMode ? "random demo mode" : "ready to parse"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          clearFile();
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-white/50 transition hover:border-red-300/30 hover:bg-red-400/10 hover:text-red-300"
                        aria-label="Remove CSV file"
                      >
                        <X size={16} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {parseError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 flex items-center gap-3 rounded-xl border border-red-300/20 bg-red-400/[0.08] p-4 text-sm text-red-200"
                  >
                    <AlertTriangle size={17} className="shrink-0 text-red-300" />
                    <span>{parseError}</span>
                  </motion.div>
                )}

                {parseOk && randomDemoMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-4"
                  >
                    <div className="flex items-start gap-3 rounded-xl border border-purple-300/20 bg-purple-400/[0.08] p-4 text-sm text-purple-100">
                      <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-purple-300" />
                      <span>
                        Random demo ready. Click below — each run uses a new random sample. No manual feature input needed.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handlePredict}
                      disabled={loading}
                      className={`flex w-full items-center justify-center gap-3 rounded-2xl border px-5 py-4 text-sm font-bold transition-all duration-300 ${
                        loading
                          ? "cursor-wait border-orange-300/20 bg-orange-400/20 text-white/70"
                          : "border-orange-300/70 bg-gradient-to-r from-[var(--accent-strong)] to-[var(--accent-bright)] text-[#180b06] shadow-[0_0_32px_rgba(255,107,53,0.25)] hover:-translate-y-0.5 hover:shadow-[0_0_42px_rgba(255,107,53,0.38)]"
                      }`}
                    >
                      {loading ? (
                        <>
                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/25 border-t-white" />
                          Analyzing bearing...
                        </>
                      ) : (
                        <>
                          <Zap size={18} />
                          Run random prediction
                        </>
                      )}
                    </button>
                  </motion.div>
                )}

                {parseOk && !randomDemoMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.07] p-4 text-sm text-emerald-100"
                  >
                    <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-300" />
                    <span>
                      {`CSV parsed — ${REQUIRED_KEYS.length} features loaded into the form. Switch to Manual Input to review or edit before predicting.`}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === "manual" && (
            <motion.div
              key="manual"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-8 rounded-2xl border border-white/[0.07] bg-black/20 p-4">
                {randomDemoMode ? (
                  <div className="rounded-xl border border-purple-300/20 bg-purple-400/[0.08] p-4 text-sm text-purple-100">
                    <p className="font-semibold text-purple-50">Random demo mode active</p>
                    <p className="mt-2 text-purple-100/80">
                      The uploaded CSV is a demo trigger only. Each prediction randomly samples new features on the server, so results will vary every time you click predict.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <span className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-white/40">
                        Fields filled
                      </span>
                      <span className={`font-mono text-xs font-semibold ${filledCount === ALL_FEATURES.length ? "text-emerald-300" : "text-white/55"}`}>
                        {filledCount} / {ALL_FEATURES.length}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
                      <motion.div
                        animate={{ width: `${(filledCount / ALL_FEATURES.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                        className={`h-full rounded-full ${filledCount === ALL_FEATURES.length ? "bg-emerald-300 shadow-[0_0_16px_rgba(134,239,172,0.5)]" : "bg-gradient-to-r from-[var(--accent-strong)] to-[var(--accent-bright)] shadow-[0_0_16px_rgba(255,107,53,0.35)]"}`}
                      />
                    </div>
                  </>
                )}
              </div>

              <form onSubmit={handlePredict} noValidate={randomDemoMode}>
                {!randomDemoMode && (
                  <>
                <div className="mb-9">
                  <SectionHeading eyebrow="Signal analysis" title="Time domain features" icon="∿" />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {TIME_DOMAIN.map((feature) => (
                      <FeatureInput
                        key={feature.key}
                        feature={feature}
                        value={features[feature.key]}
                        onChange={handleFeatureChange}
                      />
                    ))}
                  </div>
                </div>

                <div className="mb-9">
                  <SectionHeading eyebrow="Frequency analysis" title="Frequency domain features" icon="⌁" />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {FREQ_DOMAIN.map((feature) => (
                      <FeatureInput
                        key={feature.key}
                        feature={feature}
                        value={features[feature.key]}
                        onChange={handleFeatureChange}
                      />
                    ))}
                  </div>
                </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading || !canPredict}
                  className={`flex w-full items-center justify-center gap-3 rounded-2xl border px-5 py-4 text-sm font-bold transition-all duration-300 ${
                    !canPredict
                      ? "cursor-not-allowed border-white/[0.08] bg-white/[0.05] text-white/25"
                      : loading
                      ? "cursor-wait border-orange-300/20 bg-orange-400/20 text-white/70"
                      : "border-orange-300/70 bg-gradient-to-r from-[var(--accent-strong)] to-[var(--accent-bright)] text-[#180b06] shadow-[0_0_32px_rgba(255,107,53,0.25)] hover:-translate-y-0.5 hover:shadow-[0_0_42px_rgba(255,107,53,0.38)]"
                  }`}
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/25 border-t-white" />
                      Analyzing bearing...
                    </>
                  ) : (
                    <>
                      <Zap size={18} />
                      {randomDemoMode
                        ? "Run random prediction"
                        : allFilled
                        ? "Run AI prediction"
                        : `Fill ${ALL_FEATURES.length - filledCount} more field${ALL_FEATURES.length - filledCount !== 1 ? "s" : ""} to predict`}
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      <AnimatePresence>
        {apiError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-xl border border-red-300/20 bg-red-400/[0.08] p-4 text-sm text-red-200"
          >
            <AlertTriangle size={17} className="shrink-0 text-red-300" />
            <span>{apiError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && faultConfig && (
          <motion.section
            key="result"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-5"
          >
            <div
              className="relative overflow-hidden rounded-[2rem] border p-6 sm:p-8"
              style={{
                background: faultConfig.bg,
                borderColor: faultConfig.border,
                boxShadow: `0 0 60px ${faultConfig.color}12`,
              }}
            >
              <div
                className="absolute -right-20 -top-24 h-64 w-64 rounded-full blur-[90px]"
                style={{ background: `${faultConfig.color}22` }}
              />

              <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
                <div className="flex-1">
                  <p className="eyebrow">Inference complete / Verdict</p>
                  <div className="mt-4 text-4xl" aria-hidden="true">
                    {faultConfig.icon}
                  </div>
                  <h2
                    className="mt-3 text-3xl font-semibold capitalize tracking-tight sm:text-4xl"
                    style={{ color: faultConfig.color }}
                  >
                    {result.prediction.replace(/_/g, " ")}
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">
                    {faultConfig.desc}
                  </p>
                </div>

                <ConfidenceDial confidence={result.confidence} />

                <div className="grid w-full shrink-0 grid-cols-1 gap-4 sm:grid-cols-3 lg:w-auto lg:grid-cols-1">
                  {[
                    ["Prediction ID", `#${result.prediction_id}`],
                    ["Class index", result.prediction_class],
                    ["Timestamp", new Date(result.prediction_time).toLocaleString()],
                  ].map(([label, value]) => (
                    <div key={label} className="min-w-[10rem]">
                      <p className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-white/35">
                        {label}
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-white/80">
                        {label === "Timestamp" && <Clock size={13} className="text-white/40" />}
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="glass-card p-5 sm:p-7">
                <div className="mb-7 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-300/10 text-[var(--cyan)]">
                    <BarChart2 size={17} />
                  </span>
                  <div>
                    <p className="eyebrow">Classification spread</p>
                    <h3 className="mt-1 text-lg font-semibold text-white">
                      Class probabilities
                    </h3>
                  </div>
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

              <div className="glass-card p-5 sm:p-7">
                <div className="mb-7 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-400/10 text-[var(--accent-bright)]">
                    <TrendingUp size={17} />
                  </span>
                  <div>
                    <p className="eyebrow">Explainable AI</p>
                    <h3 className="mt-1 text-lg font-semibold text-white">
                      Feature influence / SHAP
                    </h3>
                  </div>
                </div>

                {visibleShap.map(([feature, value]) => (
                  <ShapBar key={feature} feature={feature} value={value} />
                ))}

                {shapEntries.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setShowAllShap((previous) => !previous)}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg px-2 py-1 font-mono text-[0.68rem] uppercase tracking-wider text-[var(--accent-bright)] transition hover:bg-orange-400/10"
                  >
                    {showAllShap ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {showAllShap ? "Show less" : `Show all ${shapEntries.length} features`}
                  </button>
                )}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

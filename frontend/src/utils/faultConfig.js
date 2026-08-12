export const FAULT_CONFIG = {
  Normal: {
    color: "#22c55e",
    bg: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.3)",
    icon: "✅",
    desc: "Bearing is operating normally. No fault detected.",
    badge: "bg-green-500/10 text-green-400 border-green-500/30",
  },
  Ball: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.3)",
    icon: "⚠️",
    desc: "Ball fault detected. Inspect rolling elements for wear or pitting.",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  Inner_Race: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.3)",
    icon: "🔴",
    desc: "Inner race fault detected. Check shaft and inner ring surface.",
    badge: "bg-red-500/10 text-red-400 border-red-500/30",
  },
  Outer_Race: {
    color: "#a855f7",
    bg: "rgba(168,85,247,0.1)",
    border: "rgba(168,85,247,0.3)",
    icon: "🟣",
    desc: "Outer race fault detected. Inspect bearing housing and outer ring.",
    badge: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  },
};

export function getFaultConfig(prediction) {
  if (!prediction) return null;
  const norm = prediction.replace(" ", "_");
  return (
    FAULT_CONFIG[norm] ||
    FAULT_CONFIG[prediction] || {
      color: "#6366f1",
      bg: "rgba(99,102,241,0.1)",
      border: "rgba(99,102,241,0.3)",
      icon: "🔵",
      desc: "Classification complete.",
      badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    }
  );
}

export function formatFaultLabel(prediction) {
  return prediction?.replace(/_/g, " ") ?? "";
}

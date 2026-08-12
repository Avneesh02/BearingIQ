function Loader() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid-bg relative flex min-h-[240px] w-full items-center justify-center overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.025] p-8"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/10 blur-[70px]" />

      <div className="relative flex flex-col items-center justify-center">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <span className="absolute inset-0 animate-spin rounded-full border border-orange-300/20 border-t-[var(--accent-bright)]" />
          <span className="absolute inset-3 animate-[spin_2.8s_linear_infinite_reverse] rounded-full border border-cyan-300/20 border-r-[var(--cyan)]" />
          <span className="absolute inset-7 rounded-full border border-white/10 bg-orange-400/10 shadow-[0_0_28px_rgba(255,107,53,0.25)]" />
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[var(--accent-bright)] shadow-[0_0_16px_rgba(255,147,95,0.9)]" />
        </div>

        <p className="mt-6 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-white/45">
          Loading diagnostic data
        </p>
        <p className="mt-2 text-sm text-white/25">Please wait...</p>
      </div>
    </div>
  );
}

export default Loader;

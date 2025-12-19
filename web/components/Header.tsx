import Link from "next/link";

const heroMetrics = [
  {
    label: "Guided missions",
    value: "11",
    detail: "CLI basics through OSPF mastery",
  },
  {
    label: "Command drills",
    value: "40+",
    detail: "Repeatable, competition-style prompts",
  },
  {
    label: "Embedded labs",
    value: "4",
    detail: "Live Cisco-style terminals",
  },
];

export function Header() {
  return (
    <header className="relative isolate overflow-hidden px-6 pb-16 pt-24 text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/80 via-slate-950 to-slate-950" />
      <div
        className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl md:h-[28rem] md:w-[28rem]"
        aria-hidden
      />
      <div
        className="absolute right-[-10%] top-10 h-48 w-48 rounded-full bg-indigo-500/30 blur-3xl md:h-64 md:w-64"
        aria-hidden
      />
      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-slate-200">
            <span>2025 Cohort</span>
            <span className="text-cyan-300">•</span>
            <span>Live practice</span>
          </div>
          <div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
              Command the network CLI with confidence.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-200">
              This is a scrollable operations notebook built for students and
              CyberPatriot teams. Every concept flows into an embedded IOS
              terminal so you can read, type, and verify without switching tabs.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              href="#lessons"
              className="inline-flex items-center justify-center rounded-full bg-cyan-400/90 px-6 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-cyan-500/30 transition hover:bg-cyan-300"
            >
              Begin the mission
            </Link>
            <a
              href="#curriculum"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-base font-semibold text-white transition hover:border-cyan-200/40 hover:text-cyan-100"
            >
              See curriculum map
            </a>
          </div>
          <div className="grid w-full gap-4 sm:grid-cols-3">
            {heroMetrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 backdrop-blur-xl"
              >
                <div className="text-3xl font-bold text-white">
                  {metric.value}
                </div>
                <p className="text-sm uppercase tracking-widest text-slate-300">
                  {metric.label}
                </p>
                <p className="mt-2 text-xs text-slate-400">{metric.detail}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div
            className="absolute -top-10 right-6 hidden h-24 w-24 rounded-full bg-cyan-400/20 blur-3xl lg:block"
            aria-hidden
          />
          <div className="relative rounded-3xl border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-cyan-500/20 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-[0.3em] text-slate-400">
              <span>Scenario Brief</span>
              <span className="text-cyan-300">Live</span>
            </div>
            <p className="mt-4 text-lg text-slate-100">
              “Reach privileged mode, lock it down, and prep the switch for
              campus deployment.”
            </p>
            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-4 font-mono text-sm text-cyan-200 shadow-inner">
              <p>Switch&gt; enable</p>
              <p>Switch# configure terminal</p>
              <p>Switch(config)# hostname Aurora-Core</p>
              <p>Switch(config)# enable secret C1sc0R0ck$</p>
            </div>
            <div className="mt-6 grid gap-3 text-sm text-slate-300">
              <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-2">
                <span>Estimated time</span>
                <span className="font-semibold text-white">08 min</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-2">
                <span>Live terminals</span>
                <span className="font-semibold text-white">3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

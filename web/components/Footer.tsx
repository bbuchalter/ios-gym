export function Footer() {
  const navigation = [
    { label: "Overview", href: "#top" },
    { label: "Curriculum", href: "#curriculum" },
    { label: "Lessons", href: "#lessons" },
  ];

  return (
    <footer className="relative mt-24 border-t border-white/10 bg-slate-950/80 px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            IOS Practice Lab
          </p>
          <p className="mt-4 text-lg text-slate-200">
            A teaching surface for mentors, teams, and self-starters who want
            their first network role to feel familiar on day one.
          </p>
          <p className="mt-6 text-sm text-slate-500">
            Built with real Cisco-style grammar, animated diagrams, and scroll
            choreography.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
            Navigate
          </p>
          <ul className="mt-4 space-y-3 text-slate-300">
            {navigation.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="text-sm text-slate-300 transition hover:text-cyan-200"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
            Contact
          </p>
          <ul className="mt-4 space-y-3 text-slate-300 text-sm">
            <li>Coach-ready briefings</li>
            <li>Weekly cohort updates</li>
            <li>feedback@practice-lab.dev</li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-6xl border-t border-white/5 pt-6 text-sm text-slate-500 flex flex-wrap items-center justify-between gap-4">
        <span>© {new Date().getFullYear()} IOS Practice Lab</span>
        <span>CyberPatriot ready • Live CLI • 11-lesson arc</span>
      </div>
    </footer>
  );
}


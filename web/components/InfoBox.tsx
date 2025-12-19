type Variant = 'info' | 'tip' | 'help' | 'important' | 'warning' | 'real-world';

const variantStyles: Record<
  Variant,
  { panel: string; glow: string; ring: string }
> = {
  info: {
    panel: 'bg-cyan-500/5',
    glow: 'from-cyan-400/30 via-transparent to-transparent',
    ring: 'border-cyan-400/30',
  },
  tip: {
    panel: 'bg-emerald-500/5',
    glow: 'from-emerald-400/30 via-transparent to-transparent',
    ring: 'border-emerald-400/30',
  },
  help: {
    panel: 'bg-amber-500/5',
    glow: 'from-amber-400/30 via-transparent to-transparent',
    ring: 'border-amber-400/30',
  },
  important: {
    panel: 'bg-rose-500/5',
    glow: 'from-rose-400/30 via-transparent to-transparent',
    ring: 'border-rose-400/30',
  },
  warning: {
    panel: 'bg-orange-500/5',
    glow: 'from-orange-400/30 via-transparent to-transparent',
    ring: 'border-orange-400/30',
  },
  'real-world': {
    panel: 'bg-sky-500/5',
    glow: 'from-sky-400/30 via-transparent to-transparent',
    ring: 'border-sky-400/30',
  },
};

interface InfoBoxProps {
  variant: Variant;
  children: React.ReactNode;
}

export function InfoBox({ variant, children }: InfoBoxProps) {
  const styles = variantStyles[variant];
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${styles.ring} ${styles.panel} px-6 py-5 backdrop-blur-xl my-5`}
    >
      <div
        className={`pointer-events-none absolute inset-y-0 right-[-20%] w-2/3 bg-gradient-to-r ${styles.glow} blur-3xl opacity-70`}
        aria-hidden
      />
      <div className="relative space-y-3 text-slate-100">{children}</div>
    </div>
  );
}


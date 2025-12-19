type Variant = 'info' | 'tip' | 'help' | 'important' | 'warning' | 'real-world';

const variantStyles: Record<Variant, string> = {
  info: 'bg-blue-500/10 border-l-blue-500 border-blue-500/20',
  tip: 'bg-emerald-500/10 border-l-emerald-500 border-emerald-500/20',
  help: 'bg-amber-500/10 border-l-amber-500 border-amber-500/20',
  important: 'bg-rose-500/10 border-l-rose-500 border-rose-500/20',
  warning: 'bg-amber-500/10 border-l-amber-500 border-amber-500/20',
  'real-world': 'bg-cyan-500/10 border-l-cyan-500 border-cyan-500/20',
};

interface InfoBoxProps {
  variant: Variant;
  children: React.ReactNode;
}

export function InfoBox({ variant, children }: InfoBoxProps) {
  return (
    <div className={`p-6 rounded-xl my-6 border-l-4 border backdrop-blur-sm ${variantStyles[variant]}`}>
      {children}
    </div>
  );
}


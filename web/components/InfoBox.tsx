type Variant = 'info' | 'tip' | 'help' | 'important' | 'warning' | 'real-world';

const variantStyles: Record<Variant, string> = {
  info: 'bg-primary/10 border-primary',
  tip: 'bg-secondary/10 border-secondary',
  help: 'bg-warning/10 border-warning',
  important: 'bg-danger/10 border-danger',
  warning: 'bg-warning/10 border-warning',
  'real-world': 'bg-secondary/10 border-secondary',
};

interface InfoBoxProps {
  variant: Variant;
  children: React.ReactNode;
}

export function InfoBox({ variant, children }: InfoBoxProps) {
  return (
    <div className={`p-6 rounded-lg my-6 border-l-4 ${variantStyles[variant]}`}>
      {children}
    </div>
  );
}


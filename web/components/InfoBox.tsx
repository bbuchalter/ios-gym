type Variant = 'info' | 'tip' | 'help' | 'important' | 'warning' | 'real-world' | 'success';

const variantStyles: Record<Variant, { bg: string; border: string }> = {
  info: {
    bg: 'bg-blue-900',
    border: 'border-blue-600',
  },
  tip: {
    bg: 'bg-green-900',
    border: 'border-green-600',
  },
  help: {
    bg: 'bg-yellow-900',
    border: 'border-yellow-600',
  },
  important: {
    bg: 'bg-red-900',
    border: 'border-red-600',
  },
  warning: {
    bg: 'bg-orange-900',
    border: 'border-orange-600',
  },
  'real-world': {
    bg: 'bg-blue-900',
    border: 'border-blue-600',
  },
  success: {
    bg: 'bg-green-900',
    border: 'border-green-600',
  },
};

interface InfoBoxProps {
  variant: Variant;
  children: React.ReactNode;
}

export function InfoBox({ variant, children }: InfoBoxProps) {
  // eslint-disable-next-line security/detect-object-injection
  const styles = variantStyles[variant];
  return (
    <div className={`border ${styles.border} ${styles.bg} my-4 rounded-lg p-4`}>{children}</div>
  );
}

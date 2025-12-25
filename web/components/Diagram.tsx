interface DiagramProps {
  title?: string;
  children: React.ReactNode;
  variant?: 'default' | 'error' | 'success';
}

export function Diagram({ title, children, variant = 'default' }: DiagramProps) {
  const variantStyles = {
    default: 'border-gray-700 bg-gray-800',
    error: 'border-red-900 bg-red-950/30',
    success: 'border-green-900 bg-green-950/30',
  };

  return (
    <div className={`my-4 border rounded-lg p-4 ${variantStyles[variant]}`}>
      {title && (
        <h4 className="text-sm font-semibold text-gray-400 mb-2">
          {title}
        </h4>
      )}
      <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap">
        {children}
      </pre>
    </div>
  );
}


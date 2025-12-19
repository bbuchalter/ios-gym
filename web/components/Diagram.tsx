interface DiagramProps {
  title?: string;
  children: React.ReactNode;
}

export function Diagram({ title, children }: DiagramProps) {
  return (
    <div className="my-4 border border-gray-700 bg-gray-800 rounded-lg p-4">
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


interface DiagramProps {
  title?: string;
  children: React.ReactNode;
}

export function Diagram({ title, children }: DiagramProps) {
  return (
    <div className="bg-[#0d1117] p-6 rounded-lg my-6 overflow-x-auto">
      {title && <h4 className="text-text-bright mb-2 font-semibold">{title}</h4>}
      <pre className="font-mono text-sm leading-relaxed text-secondary m-0">
        {children}
      </pre>
    </div>
  );
}


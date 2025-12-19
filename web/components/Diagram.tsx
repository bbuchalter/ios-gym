interface DiagramProps {
  title?: string;
  children: React.ReactNode;
}

export function Diagram({ title, children }: DiagramProps) {
  return (
    <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl my-6 overflow-x-auto shadow-inner">
      {title && <h4 className="text-white mb-3 font-semibold text-sm uppercase tracking-wide text-slate-400">{title}</h4>}
      <pre className="font-mono text-sm leading-relaxed text-cyan-400 m-0">
        {children}
      </pre>
    </div>
  );
}


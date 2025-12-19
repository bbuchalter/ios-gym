interface DiagramProps {
  title?: string;
  children: React.ReactNode;
}

export function Diagram({ title, children }: DiagramProps) {
  return (
    <div className="relative my-6 overflow-hidden rounded-2xl border border-white/5 bg-slate-950/80 p-6 shadow-inner shadow-cyan-500/5">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-10" />
      {title && (
        <h4 className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-4">
          {title}
        </h4>
      )}
      <pre className="relative m-0 whitespace-pre-wrap font-mono text-sm leading-relaxed text-cyan-300">
        {children}
      </pre>
    </div>
  );
}


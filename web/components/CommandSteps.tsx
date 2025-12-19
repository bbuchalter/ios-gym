interface CommandStepsProps {
  steps: string[];
}

export function CommandSteps({ steps }: CommandStepsProps) {
  return (
    <ol className="mt-6 mb-4 space-y-4 rounded-2xl border border-white/5 bg-slate-950/60 p-8 list-decimal list-inside shadow-lg shadow-slate-950/50">
      {steps.map((step, index) => (
        <li key={index} className="leading-relaxed text-slate-200">
          {step.includes('<code>') ? (
            <span dangerouslySetInnerHTML={{ __html: step }} />
          ) : (
            step
          )}
        </li>
      ))}
    </ol>
  );
}


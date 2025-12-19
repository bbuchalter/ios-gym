interface CommandStepsProps {
  steps: string[];
}

export function CommandSteps({ steps }: CommandStepsProps) {
  return (
    <ol className="bg-medium-bg p-6 rounded-lg my-6 border border-border list-decimal list-inside space-y-4">
      {steps.map((step, index) => (
        <li key={index} className="leading-relaxed">
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


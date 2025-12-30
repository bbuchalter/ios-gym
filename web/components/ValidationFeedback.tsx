import type { ValidationResult } from '@src/validation/runtime-validator';

interface ValidationFeedbackProps {
  result: ValidationResult;
}

export function ValidationFeedback({ result }: ValidationFeedbackProps) {
  if (result.passed) {
    return (
      <div className="animate-in fade-in mt-6 rounded-lg border border-green-600 bg-green-900 p-6 duration-300">
        <p className="mb-2 text-lg font-semibold text-green-300">
          ✓ Excellent work! Configuration is correct!
        </p>
        <p className="text-green-200">
          All requirements have been met. You can proceed to the next section.
        </p>
      </div>
    );
  }
  
  // Check if the only error is config not saved
  const onlyConfigNotSaved = 
    result.errors.length === 1 && 
    result.errors[0].assertionType === 'config_saved';
  
  return (
    <div className="animate-in fade-in mt-6 rounded-lg border border-red-600 bg-red-900 p-6 duration-300">
      <p className="mb-3 text-lg font-semibold text-red-300">
        {onlyConfigNotSaved ? '⚠️ Configuration Not Saved' : '✗ Configuration Incomplete'}
      </p>
      <p className="mb-4 text-red-200">
        {onlyConfigNotSaved 
          ? 'Your configuration looks correct, but you need to save it!'
          : 'Please review and fix the following:'}
      </p>
      <ul className="space-y-3">
        {result.errors.map((error, i) => (
          <li key={i} className="text-red-200">
            <div className="flex items-start gap-3 rounded bg-red-950/50 p-3">
              <span className="mt-0.5 text-lg text-red-400">•</span>
              <div className="flex-1">
                <p className="font-medium">{error.message}</p>
                {error.expected && error.actual && (
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="text-red-300">
                      Expected: <code className="rounded border border-red-700 bg-red-950 px-2 py-0.5">{String(error.expected)}</code>
                    </p>
                    <p className="text-red-300">
                      Found: <code className="rounded border border-red-700 bg-red-950 px-2 py-0.5">{String(error.actual)}</code>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 border-t border-red-700 pt-4">
        <p className="mb-2 font-semibold text-red-200">💡 How to Check Your Configuration:</p>
        <ul className="ml-6 space-y-2 text-sm text-red-200">
          <li><code>show ip interface brief</code> — Check interface IPs and status</li>
          <li><code>show running-config</code> — See all your configuration</li>
          <li><code>show vlan brief</code> — Check VLANs (if applicable)</li>
        </ul>
        <p className="mt-3 text-sm text-red-300 italic">
          Use these commands to find what's missing or incorrect, then fix it and try "Check My Work" again!
        </p>
      </div>
    </div>
  );
}


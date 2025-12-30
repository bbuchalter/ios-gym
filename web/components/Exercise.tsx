'use client';

import { RuntimeValidator } from '@src/validation/RuntimeValidator';
import dynamic from 'next/dynamic';
import { useState, useRef, useCallback, useEffect } from 'react';

import type { CLISession } from '@src/cli-session';
import type { CommandGrammar, DeviceModel } from '@src/types';
import type { Exercise as ExerciseType, Assertion } from '@src/validation/types';

// Dynamically import Terminal to avoid SSR issues
const Terminal = dynamic(() => import('./Terminal'), {
  ssr: false,
  loading: () => (
    <div
      className="my-8 rounded-lg border border-gray-700 bg-gray-800"
      style={{ minHeight: '470px' }}
    >
      <div className="flex items-center justify-between border-b border-gray-700 bg-gray-900 px-4 py-2 font-mono text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          <span className="h-2 w-2 rounded-full bg-yellow-500" />
          <span className="h-2 w-2 rounded-full bg-green-500" />
        </div>
      </div>
      <div className="p-8 text-center text-gray-400">Loading terminal...</div>
    </div>
  ),
});

interface ExerciseProps {
  exercise: ExerciseType;
  grammar: CommandGrammar;
  deviceModel?: DeviceModel;
  showCommands?: boolean;
  onStepChange?: (direction: 'next' | 'previous') => void;
}

type ValidationState = 'not-run' | 'validating' | 'pass' | 'fail';

type ViewMode = 'step-by-step' | 'show-all';

export function Exercise({ exercise, grammar, deviceModel, showCommands = true }: ExerciseProps) {
  const [commandsVisible, setCommandsVisible] = useState<boolean>(showCommands);
  const [viewMode, setViewMode] = useState<ViewMode>('step-by-step');
  const [validationState, setValidationState] = useState<ValidationState>('not-run');
  const [errors, setErrors] = useState<string[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const sessionRef = useRef<CLISession>(null);
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const validationResultsRef = useRef<HTMLDivElement>(null);
  const validator = useRef(new RuntimeValidator()).current;

  // Auto-focus appropriate element based on validation state
  useEffect(() => {
    if (validationState === 'not-run' && terminalContainerRef.current) {
      // Returning to terminal - focus it
      const xtermTextarea = terminalContainerRef.current.querySelector(
        '.xterm-helper-textarea'
      ) as HTMLTextAreaElement;
      if (xtermTextarea) {
        requestAnimationFrame(() => {
          xtermTextarea.focus();
        });
      }
    } else if (
      (validationState === 'fail' || validationState === 'pass') &&
      validationResultsRef.current
    ) {
      // Showing validation results - focus the container
      requestAnimationFrame(() => {
        validationResultsRef.current?.focus();
      });
    }
  }, [validationState]);

  // Flatten all steps from all goals
  const allSteps = exercise.goals.flatMap((goal) => goal.steps);
  const totalSteps = allSteps.length;
  // Safe: currentStepIndex is a controlled state number from useState, not user input
  // eslint-disable-next-line security/detect-object-injection
  const currentStep = allSteps[currentStepIndex];

  const goToNextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  // Keyboard shortcuts handler - passed to Terminal
  const handleKeyboardShortcut = useCallback(
    (event: KeyboardEvent) => {
      // Cmd+\ or Ctrl+\ for Check My Work / Try Again (toggle)
      if ((event.metaKey || event.ctrlKey) && event.key === '\\') {
        event.preventDefault();

        // If showing results, return to terminal
        if (validationState === 'fail' || validationState === 'pass') {
          setValidationState('not-run');
          return;
        }

        // If in terminal (not-run or validating), run validation
        if (validationState === 'not-run') {
          // Inline validation logic to avoid stale closure
          setValidationState('validating');

          setTimeout(() => {
            if (!sessionRef.current) {
              setErrors(['Terminal session not initialized. Please try again.']);
              setValidationState('fail');
              return;
            }

            const result = validator.validate(exercise, sessionRef.current.deviceState);

            if (result.success) {
              setValidationState('pass');
              setErrors([]);
            } else {
              setValidationState('fail');
              setErrors(result.errors.map((e: { message: string }) => e.message));
            }
          }, 100);
        }
        return;
      }

      // Only handle navigation in step-by-step mode
      if (viewMode !== 'step-by-step') return;

      // Cmd+[ or Ctrl+[ for previous
      if ((event.metaKey || event.ctrlKey) && event.key === '[') {
        event.preventDefault();
        setCurrentStepIndex((prev) => Math.max(0, prev - 1));
      }
      // Cmd+] or Ctrl+] for next
      else if ((event.metaKey || event.ctrlKey) && event.key === ']') {
        event.preventDefault();
        setCurrentStepIndex((prev) => Math.min(totalSteps - 1, prev + 1));
      }
    },
    [viewMode, totalSteps, validationState, validator, exercise]
  );

  const handleCheckWork = () => {
    setValidationState('validating');

    // Give a brief moment for UI to update
    setTimeout(() => {
      if (!sessionRef.current) {
        setErrors(['Terminal session not initialized. Please try again.']);
        setValidationState('fail');
        return;
      }

      const result = validator.validate(exercise, sessionRef.current.deviceState);

      if (result.success) {
        setValidationState('pass');
        setErrors([]);
      } else {
        setValidationState('fail');
        setErrors(result.errors.map((e: { message: string }) => e.message));
      }
    }, 100);
  };

  return (
    <div className="my-6">
      {/* View Mode and Controls */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('step-by-step')}
            className={`rounded px-3 py-1 text-xs font-semibold transition-colors ${
              viewMode === 'step-by-step'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            Step-by-Step
          </button>
          <button
            onClick={() => setViewMode('show-all')}
            className={`rounded px-3 py-1 text-xs font-semibold transition-colors ${
              viewMode === 'show-all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            Show All
          </button>
        </div>
        <label className="flex cursor-pointer items-center gap-2">
          <span className="text-xs font-semibold text-gray-400">Show commands</span>
          <div
            onClick={() => setCommandsVisible(!commandsVisible)}
            className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
              commandsVisible ? 'bg-blue-600' : 'bg-gray-600'
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                commandsVisible ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </label>
      </div>

      {/* Instructions Container */}
      {viewMode === 'step-by-step' ? (
        /* Step-by-Step Mode */
        <div className="mb-3 rounded-lg border border-gray-700 bg-gray-800 p-3">
          {/* Progress Bar */}
          <div className="mb-2 flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-400">
              Step {currentStepIndex + 1} of {totalSteps}
            </span>
            <div className="h-1.5 max-w-xs flex-1 rounded-full bg-gray-700">
              <div
                className="h-1.5 rounded-full bg-blue-500 transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Step Display */}
          <div className="rounded-lg border border-gray-600 bg-gray-900 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {currentStepIndex + 1}
              </div>
              <div className="flex-1 text-sm font-medium text-gray-200">
                {currentStep.objective}
              </div>
              {commandsVisible && currentStep.command && (
                <div className="flex-shrink-0">
                  <code className="rounded border border-gray-700 bg-gray-800 px-3 py-1.5 font-mono text-sm text-green-400">
                    {currentStep.command}
                  </code>
                </div>
              )}
            </div>
          </div>

          {/* Navigation and Validation */}
          <div className="mt-2 flex items-center justify-between gap-2">
            <button
              onClick={goToPreviousStep}
              disabled={currentStepIndex === 0}
              className={`flex items-center gap-2 rounded px-4 py-1.5 text-xs font-semibold transition-colors ${
                currentStepIndex === 0
                  ? 'cursor-not-allowed bg-gray-700 text-gray-500'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span>← Previous</span>
              <kbd className="text-xs opacity-60">⌘[</kbd>
            </button>

            <button
              onClick={() => {
                if (validationState === 'fail' || validationState === 'pass') {
                  setValidationState('not-run');
                } else {
                  handleCheckWork();
                }
              }}
              disabled={validationState === 'validating'}
              className={`flex items-center gap-2 rounded px-4 py-1.5 text-xs font-semibold transition-colors ${
                validationState === 'validating'
                  ? 'cursor-not-allowed bg-gray-600 text-gray-400'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <span>
                {validationState === 'validating'
                  ? 'Checking...'
                  : validationState === 'fail'
                    ? '← Try Again'
                    : validationState === 'pass'
                      ? '← Back to Terminal'
                      : '🔍 Check My Work'}
              </span>
              {validationState !== 'validating' && <kbd className="text-xs opacity-60">⌘\</kbd>}
            </button>

            <button
              onClick={goToNextStep}
              disabled={currentStepIndex === totalSteps - 1}
              className={`flex items-center gap-2 rounded px-4 py-1.5 text-xs font-semibold transition-colors ${
                currentStepIndex === totalSteps - 1
                  ? 'cursor-not-allowed bg-gray-700 text-gray-500'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span>Next →</span>
              <kbd className="text-xs opacity-60">⌘]</kbd>
            </button>
          </div>
        </div>
      ) : (
        /* Show All Mode - Compact List */
        <div className="mb-3 rounded-lg border border-gray-700 bg-gray-800 p-3">
          <div className="space-y-2">
            {allSteps.map(
              (
                step: { objective: string; command?: string; teachingPoint?: string },
                globalIdx: number
              ) => (
                <div key={`step-${globalIdx}`} className="flex items-center gap-3 py-1">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    {globalIdx + 1}
                  </span>
                  <div className="flex-1 text-sm text-gray-300">
                    {step.objective}
                    {step.teachingPoint && (
                      <span className="ml-2 text-xs text-blue-300 italic">
                        💡 {step.teachingPoint}
                      </span>
                    )}
                  </div>
                  {commandsVisible && step.command && (
                    <code className="flex-shrink-0 rounded border border-gray-700 bg-gray-900 px-2 py-1 font-mono text-xs text-green-400">
                      {step.command}
                    </code>
                  )}
                </div>
              )
            )}
          </div>

          {/* Check My Work Button for Show All Mode */}
          <div className="mt-3 flex justify-center border-t border-gray-700 pt-3">
            <button
              onClick={() => {
                if (validationState === 'fail' || validationState === 'pass') {
                  setValidationState('not-run');
                } else {
                  handleCheckWork();
                }
              }}
              disabled={validationState === 'validating'}
              className={`flex items-center gap-2 rounded px-4 py-1.5 text-xs font-semibold transition-colors ${
                validationState === 'validating'
                  ? 'cursor-not-allowed bg-gray-600 text-gray-400'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <span>
                {validationState === 'validating'
                  ? 'Checking...'
                  : validationState === 'fail'
                    ? '← Try Again'
                    : validationState === 'pass'
                      ? '← Back to Terminal'
                      : '🔍 Check My Work'}
              </span>
              {validationState !== 'validating' && <kbd className="text-xs opacity-60">⌘\</kbd>}
            </button>
          </div>
        </div>
      )}

      {/* Content Area - Terminal or Validation Results */}
      <div className="mt-4">
        {/* Terminal - Always mounted, hidden when showing validation */}
        <div
          ref={terminalContainerRef}
          className={
            validationState === 'not-run' || validationState === 'validating' ? '' : 'hidden'
          }
        >
          <Terminal
            grammar={grammar}
            deviceModel={deviceModel || exercise.deviceModel}
            sessionRef={sessionRef}
            onKeyboardShortcut={handleKeyboardShortcut}
          />
        </div>

        {/* Validation Results - Shown when validation complete */}
        {(validationState === 'fail' || validationState === 'pass') && (
          <div
            ref={validationResultsRef}
            className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800 outline-none"
            style={{ minHeight: '470px' }}
            tabIndex={0}
            onKeyDown={(e) => {
              // Handle Cmd+\ to return to terminal
              if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
                e.preventDefault();
                setValidationState('not-run');
              }
            }}
          >
            <div className="flex items-center justify-between border-b border-gray-700 bg-gray-900 px-4 py-2 font-mono text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="ml-4 text-gray-300">Validation Results</span>
              </div>
            </div>
            <div className="overflow-auto p-6" style={{ minHeight: '430px' }}>
              {validationState === 'fail' && (
                <ErrorBoxContent errors={errors} assertions={exercise.assertions} />
              )}
              {validationState === 'pass' && <SuccessBoxContent />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Error Box Content - Validation failed content
 */
function ErrorBoxContent({ errors, assertions }: { errors: string[]; assertions: Assertion[] }) {
  // Get unique diagnostic commands
  const uniqueDiagnosticCommands = Array.from(
    new Set(assertions.filter((a) => a.diagnosticCommand).map((a) => a.diagnosticCommand))
  );

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="text-6xl">❌</div>
        <div>
          <h4 className="mb-2 text-2xl font-semibold text-red-300">Validation Failed</h4>
          <p className="text-gray-300">
            Your configuration has some issues. Review the errors below and try again:
          </p>
        </div>
      </div>

      <div className="mb-4 rounded-lg bg-red-950/50 p-4">
        <h5 className="mb-3 text-sm font-semibold tracking-wide text-red-300 uppercase">
          Issues Found:
        </h5>
        <ul className="space-y-2">
          {errors.map((error, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-red-200">
              <span className="mt-0.5 text-red-400">•</span>
              <span>{error}</span>
            </li>
          ))}
        </ul>
      </div>

      {uniqueDiagnosticCommands.length > 0 && (
        <div className="rounded-lg border border-blue-700/50 bg-blue-950/30 p-4">
          <h5 className="mb-3 text-sm font-semibold text-blue-300">
            🔍 Try these commands to debug:
          </h5>
          <ul className="space-y-1.5">
            {uniqueDiagnosticCommands.map((cmd, idx) => (
              <li key={idx} className="text-sm text-gray-300">
                <code className="rounded bg-gray-900 px-2 py-1 font-mono text-blue-400">{cmd}</code>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Success Box Content - Validation passed content
 */
function SuccessBoxContent() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-6 text-8xl">🎉</div>
      <h4 className="mb-4 text-3xl font-bold text-green-300">Excellent Work!</h4>
      <p className="mb-6 max-w-2xl text-lg text-gray-300">
        Your configuration is correct! All assertions passed.
      </p>
    </div>
  );
}

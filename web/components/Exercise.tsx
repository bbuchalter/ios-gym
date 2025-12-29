'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { CLISession } from '@src/cli-session';
import type { CommandGrammar, DeviceModel } from '@src/types';
import type { Exercise as ExerciseType, Assertion } from '@src/validation/types';
import { RuntimeValidator } from '@src/validation/RuntimeValidator';
import dynamic from 'next/dynamic';
import { InfoBox } from './InfoBox';

// Dynamically import Terminal to avoid SSR issues
const Terminal = dynamic(() => import('./Terminal'), {
  ssr: false,
  loading: () => (
    <div 
      className="my-8 border border-gray-700 bg-gray-800 rounded-lg"
      style={{ minHeight: '470px' }}
    >
      <div className="flex items-center justify-between border-b border-gray-700 bg-gray-900 px-4 py-2 text-xs font-mono text-gray-400">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          <span className="h-2 w-2 rounded-full bg-yellow-500" />
          <span className="h-2 w-2 rounded-full bg-green-500" />
        </div>
      </div>
      <div className="p-8 text-gray-400 text-center">Loading terminal...</div>
    </div>
  )
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
      const xtermTextarea = terminalContainerRef.current.querySelector('.xterm-helper-textarea') as HTMLTextAreaElement;
      if (xtermTextarea) {
        requestAnimationFrame(() => {
          xtermTextarea.focus();
        });
      }
    } else if ((validationState === 'fail' || validationState === 'pass') && validationResultsRef.current) {
      // Showing validation results - focus the container
      requestAnimationFrame(() => {
        validationResultsRef.current?.focus();
      });
    }
  }, [validationState]);
  
  // Flatten all steps from all goals
  const allSteps = exercise.goals.flatMap((goal: { steps: any[] }) => goal.steps);
  const totalSteps = allSteps.length;
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
  const handleKeyboardShortcut = useCallback((event: KeyboardEvent) => {
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
      setCurrentStepIndex(prev => Math.max(0, prev - 1));
    }
    // Cmd+] or Ctrl+] for next
    else if ((event.metaKey || event.ctrlKey) && event.key === ']') {
      event.preventDefault();
      setCurrentStepIndex(prev => Math.min(totalSteps - 1, prev + 1));
    }
  }, [viewMode, totalSteps, validationState, validator, exercise]);
  
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
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('step-by-step')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              viewMode === 'step-by-step'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            Step-by-Step
          </button>
          <button
            onClick={() => setViewMode('show-all')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              viewMode === 'show-all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            Show All
          </button>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-xs text-gray-400 font-semibold">Show commands</span>
          <div
            onClick={() => setCommandsVisible(!commandsVisible)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
              commandsVisible ? 'bg-blue-600' : 'bg-gray-600'
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                commandsVisible ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </label>
      </div>
      
      {/* Instructions Container */}
      {viewMode === 'step-by-step' ? (
        /* Step-by-Step Mode */
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-3 mb-3">
          {/* Progress Bar */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-semibold text-gray-400">
              Step {currentStepIndex + 1} of {totalSteps}
            </span>
            <div className="flex-1 bg-gray-700 rounded-full h-1.5 max-w-xs">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        
        {/* Current Step Display */}
        <div className="bg-gray-900 rounded-lg p-3 border border-gray-600">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {currentStepIndex + 1}
            </div>
            <div className="flex-1 text-gray-200 text-sm font-medium">
              {currentStep.objective}
            </div>
            {commandsVisible && currentStep.command && (
              <div className="flex-shrink-0">
                <code className="text-green-400 font-mono text-sm bg-gray-800 px-3 py-1.5 rounded border border-gray-700">
                  {currentStep.command}
                </code>
              </div>
            )}
          </div>
        </div>
        
        {/* Navigation and Validation */}
        <div className="flex items-center justify-between mt-2 gap-2">
          <button
            onClick={goToPreviousStep}
            disabled={currentStepIndex === 0}
            className={`px-4 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-2 ${
              currentStepIndex === 0
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
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
            className={`px-4 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-2 ${
              validationState === 'validating'
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
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
            className={`px-4 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-2 ${
              currentStepIndex === totalSteps - 1
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
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
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-3 mb-3">
          <div className="space-y-2">
            {allSteps.map((step: { objective: string; command?: string; teachingPoint?: string }, globalIdx: number) => (
              <div key={`step-${globalIdx}`} className="flex items-center gap-3 py-1">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                  {globalIdx + 1}
                </span>
                <div className="flex-1 text-gray-300 text-sm">
                  {step.objective}
                  {step.teachingPoint && (
                    <span className="text-xs text-blue-300 ml-2 italic">
                      💡 {step.teachingPoint}
                    </span>
                  )}
                </div>
                {commandsVisible && step.command && (
                  <code className="flex-shrink-0 text-green-400 font-mono text-xs bg-gray-900 px-2 py-1 rounded border border-gray-700">
                    {step.command}
                  </code>
                )}
              </div>
            ))}
          </div>
          
          {/* Check My Work Button for Show All Mode */}
          <div className="mt-3 pt-3 border-t border-gray-700 flex justify-center">
            <button
              onClick={() => {
                if (validationState === 'fail' || validationState === 'pass') {
                  setValidationState('not-run');
                } else {
                  handleCheckWork();
                }
              }}
              disabled={validationState === 'validating'}
              className={`px-4 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-2 ${
                validationState === 'validating'
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
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
          className={validationState === 'not-run' || validationState === 'validating' ? '' : 'hidden'}
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
            className="border border-gray-700 bg-gray-800 rounded-lg overflow-hidden outline-none" 
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
          <div className="flex items-center justify-between border-b border-gray-700 bg-gray-900 px-4 py-2 text-xs font-mono text-gray-400">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="h-2 w-2 rounded-full bg-yellow-500" />
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="ml-4 text-gray-300">Validation Results</span>
            </div>
          </div>
          <div className="p-6 overflow-auto" style={{ minHeight: '430px' }}>
            {validationState === 'fail' && (
              <ErrorBoxContent errors={errors} assertions={exercise.assertions} />
            )}
            {validationState === 'pass' && (
              <SuccessBoxContent />
            )}
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
    new Set(assertions.filter(a => a.diagnosticCommand).map(a => a.diagnosticCommand))
  );
  
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="text-6xl">❌</div>
        <div>
          <h4 className="text-red-300 font-semibold text-2xl mb-2">Validation Failed</h4>
          <p className="text-gray-300">
            Your configuration has some issues. Review the errors below and try again:
          </p>
        </div>
      </div>
      
      <div className="bg-red-950/50 rounded-lg p-4 mb-4">
        <h5 className="text-red-300 font-semibold mb-3 text-sm uppercase tracking-wide">Issues Found:</h5>
        <ul className="space-y-2">
          {errors.map((error, idx) => (
            <li key={idx} className="text-red-200 text-sm flex items-start gap-2">
              <span className="text-red-400 mt-0.5">•</span>
              <span>{error}</span>
            </li>
          ))}
        </ul>
      </div>
      
      {uniqueDiagnosticCommands.length > 0 && (
        <div className="bg-blue-950/30 rounded-lg p-4 border border-blue-700/50">
          <h5 className="text-blue-300 font-semibold mb-3 text-sm">🔍 Try these commands to debug:</h5>
          <ul className="space-y-1.5">
            {uniqueDiagnosticCommands.map((cmd, idx) => (
              <li key={idx} className="text-gray-300 text-sm">
                <code className="text-blue-400 bg-gray-900 px-2 py-1 rounded font-mono">{cmd}</code>
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
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="text-8xl mb-6">🎉</div>
      <h4 className="text-green-300 font-bold text-3xl mb-4">
        Excellent Work!
      </h4>
      <p className="text-gray-300 text-lg mb-6 max-w-2xl">
        Your configuration is correct! All assertions passed.
      </p>
      <div className="bg-green-950/50 rounded-lg p-6 max-w-2xl border border-green-700/50">
        <p className="text-gray-300 text-sm leading-relaxed">
          <strong className="text-green-300">🎓 Key Takeaway:</strong> You verified your work both
          manually (using <code className="text-green-400">show</code> commands) and with automated validation. This is exactly
          how professional network engineers work - always verify before trusting automation!
        </p>
      </div>
    </div>
  );
}

'use client';

import { createContext, useContext, useRef, useState, useCallback, ReactNode } from 'react';

interface TerminalRegistryContextValue {
  register: () => void;
  markReady: () => void;
  unregister: () => void;
  finishInitialLoad: () => void;
  isAllTerminalsReady: boolean;
}

const TerminalRegistryContext = createContext<TerminalRegistryContextValue | null>(null);

export function TerminalRegistryProvider({ children }: { children: ReactNode }) {
  // Use refs for counters to avoid re-renders on every increment
  const registeredCountRef = useRef(0);
  const readyCountRef = useRef(0);
  const isInitialLoadCompleteRef = useRef(false);

  // Only this state value triggers re-renders
  const [isAllTerminalsReady, setIsAllTerminalsReady] = useState(false);

  // Helper to check if all terminals are ready and update state if needed
  const checkAndUpdateReadyState = useCallback(() => {
    const nowReady =
      isInitialLoadCompleteRef.current &&
      registeredCountRef.current > 0 &&
      registeredCountRef.current === readyCountRef.current;

    // Only call setState if the value actually changes (false → true)
    if (nowReady && !isAllTerminalsReady) {
      setIsAllTerminalsReady(true);
    }
  }, [isAllTerminalsReady]);

  // Terminal calls this on mount
  const register = useCallback(() => {
    registeredCountRef.current += 1;
    checkAndUpdateReadyState();
  }, [checkAndUpdateReadyState]);

  // Terminal calls this after initialization completes
  const markReady = useCallback(() => {
    readyCountRef.current += 1;
    checkAndUpdateReadyState();
  }, [checkAndUpdateReadyState]);

  // Terminal calls this on unmount
  const unregister = useCallback(() => {
    registeredCountRef.current -= 1;
    // Don't check ready state on unregister - we only care about initial load
  }, []);

  // Page calls this after all children have had a chance to mount
  const finishInitialLoad = useCallback(() => {
    isInitialLoadCompleteRef.current = true;
    checkAndUpdateReadyState();
  }, [checkAndUpdateReadyState]);

  const value: TerminalRegistryContextValue = {
    register,
    markReady,
    unregister,
    finishInitialLoad,
    isAllTerminalsReady,
  };

  return (
    <TerminalRegistryContext.Provider value={value}>{children}</TerminalRegistryContext.Provider>
  );
}

export function useTerminalRegistry() {
  const context = useContext(TerminalRegistryContext);
  if (!context) {
    throw new Error('useTerminalRegistry must be used within TerminalRegistryProvider');
  }
  return context;
}

'use client';
import { createContext, useContext, useRef, ReactNode } from 'react';

interface LessonCounterContextValue {
  getNextLessonNumber: () => number;
  getCurrentLessonNumber: () => number;
  getTerminalId: () => string;
}

const LessonCounterContext = createContext<LessonCounterContextValue | null>(null);

export function LessonCounterProvider({ children }: { children: ReactNode }) {
  const lessonCounter = useRef(0);
  
  const getNextLessonNumber = () => {
    lessonCounter.current += 1;
    return lessonCounter.current;
  };
  
  const getCurrentLessonNumber = () => {
    return lessonCounter.current;
  };
  
  const getTerminalId = () => {
    return `terminal-${lessonCounter.current}`;
  };
  
  return (
    <LessonCounterContext.Provider value={{ getNextLessonNumber, getCurrentLessonNumber, getTerminalId }}>
      {children}
    </LessonCounterContext.Provider>
  );
}

export function useLessonCounter() {
  const context = useContext(LessonCounterContext);
  if (!context) {
    throw new Error('useLessonCounter must be used within LessonCounterProvider');
  }
  return context;
}



'use client';

import { useRef } from 'react';
import { useLessonCounter } from '@/lib/LessonCounterContext';

interface LessonSectionProps {
  title: string;
  children: React.ReactNode;
  isIntro?: boolean;
  isFinal?: boolean;
}

export function LessonSection({ title, children, isIntro, isFinal }: LessonSectionProps) {
  const counter = useLessonCounter();
  
  // Still increment counter for terminal IDs, but don't use it for display
  const hasIncrementedRef = useRef(false);
  if (!hasIncrementedRef.current && !isIntro && !isFinal) {
    counter.getNextLessonNumber();
    hasIncrementedRef.current = true;
  }

  // Generate section ID from title
  const sectionId = isIntro
    ? "lesson-intro"
    : isFinal
    ? "lesson-final"
    : `lesson-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <section id={sectionId} className="mb-20">
      <div className="border border-gray-700 rounded-lg bg-gray-800 p-8">
        <h1 className="text-5xl font-bold text-white mb-12 pb-6 border-b-2 border-blue-500">
          {title}
        </h1>
        <div className="text-gray-300">
          {children}
        </div>
      </div>
    </section>
  );
}

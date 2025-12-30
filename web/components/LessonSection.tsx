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
    <section id={sectionId} className="mb-16">
      <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
        <h1 className="mb-8 border-b-2 border-blue-500 pb-4 text-3xl font-bold text-white lg:text-4xl">
          {title}
        </h1>
        <div className="text-gray-300">
          {children}
        </div>
      </div>
    </section>
  );
}

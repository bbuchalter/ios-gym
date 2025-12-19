interface LessonSectionProps {
  lessonNumber?: number;
  title: string;
  children: React.ReactNode;
  isIntro?: boolean;
  isFinal?: boolean;
}

export function LessonSection({ lessonNumber, title, children, isIntro, isFinal }: LessonSectionProps) {
  const sectionId = lessonNumber
    ? `lesson-${lessonNumber}`
    : isIntro
    ? "lesson-intro"
    : "lesson-final";
  const paddedLesson = lessonNumber
    ? lessonNumber.toString().padStart(2, "0")
    : "";
  const badgeLabel = lessonNumber
    ? `Lesson ${paddedLesson}`
    : isIntro
    ? "Orientation"
    : "Capstone";

  return (
    <section id={sectionId} className="mb-16">
      <div className="border border-gray-700 rounded-lg bg-gray-800 p-8">
        <div className="mb-4">
          <span className="text-sm font-semibold text-gray-400">
            {badgeLabel}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-6">
          {title}
        </h1>
        <div className="text-gray-300">
          {children}
        </div>
      </div>
    </section>
  );
}


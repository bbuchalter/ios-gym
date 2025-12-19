interface LessonSectionProps {
  lessonNumber?: number;
  title: string;
  children: React.ReactNode;
  isIntro?: boolean;
  isFinal?: boolean;
}

export function LessonSection({ lessonNumber, title, children, isIntro, isFinal }: LessonSectionProps) {
  const borderColor = isIntro ? 'border-secondary' : isFinal ? 'border-success' : 'border-border';
  const bgGradient = isFinal ? 'bg-gradient-to-br from-[#1a365d] to-medium-bg' : 'bg-medium-bg';
  
  return (
    <section className={`mb-16 ${bgGradient} rounded-xl overflow-hidden border-2 ${borderColor}`}>
      <div className="p-10">
        {lessonNumber && (
          <div className="inline-block bg-gradient-to-br from-primary to-secondary text-text-bright px-6 py-2 rounded-full font-bold text-sm mb-4">
            Lesson {lessonNumber}
          </div>
        )}
        <h1 className="text-4xl text-text-bright mb-6 leading-tight">{title}</h1>
        {children}
      </div>
    </section>
  );
}


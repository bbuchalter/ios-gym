interface LessonSectionProps {
  lessonNumber?: number;
  title: string;
  children: React.ReactNode;
  isIntro?: boolean;
  isFinal?: boolean;
}

export function LessonSection({ lessonNumber, title, children, isIntro, isFinal }: LessonSectionProps) {
  const borderColor = isIntro ? 'border-cyan-500/30' : isFinal ? 'border-emerald-500/30' : 'border-slate-700/50';
  const bgGradient = isFinal 
    ? 'bg-gradient-to-br from-emerald-950/50 to-slate-900/50' 
    : isIntro
    ? 'bg-gradient-to-br from-cyan-950/30 to-slate-900/50'
    : 'bg-slate-900/50';
  
  return (
    <section className={`mb-20 ${bgGradient} backdrop-blur-sm rounded-2xl overflow-hidden border ${borderColor} shadow-xl`}>
      <div className="p-10 md:p-12">
        {lessonNumber && (
          <div className="inline-flex items-center bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2 rounded-full font-bold text-sm mb-6 shadow-lg">
            <span className="mr-2">📚</span> Lesson {lessonNumber}
          </div>
        )}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          {title}
        </h1>
        {children}
      </div>
    </section>
  );
}


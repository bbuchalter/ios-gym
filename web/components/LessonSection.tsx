interface LessonSectionProps {
  lessonNumber?: number;
  title: string;
  children: React.ReactNode;
  isIntro?: boolean;
  isFinal?: boolean;
}

export function LessonSection({ lessonNumber, title, children, isIntro, isFinal }: LessonSectionProps) {
  const borderColor = isIntro
    ? "border-cyan-500/30"
    : isFinal
    ? "border-emerald-500/30"
    : "border-white/10";
  const bgGradient = isFinal
    ? "bg-gradient-to-br from-emerald-950/40 via-slate-950/40 to-slate-900/50"
    : isIntro
    ? "bg-gradient-to-br from-cyan-950/40 via-slate-950/30 to-slate-900/40"
    : "bg-gradient-to-br from-slate-950/30 via-slate-900/40 to-slate-900/60";

  const glowColor = isFinal
    ? "from-emerald-400/20"
    : isIntro
    ? "from-cyan-400/20"
    : "from-blue-400/10";

  const timelineEnabled = !isIntro && !isFinal;
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
    <section
      id={sectionId}
      className={`relative mb-32 ${timelineEnabled ? "pl-6 md:pl-14" : ""}`}
    >
      {timelineEnabled && (
        <div
          className="absolute left-2 top-0 hidden h-full md:block"
          aria-hidden
        >
          <span className="block h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        </div>
      )}
      <div
        className={`relative rounded-3xl border ${borderColor} ${bgGradient} backdrop-blur-2xl shadow-2xl shadow-slate-950/40`}
      >
        <div
          className={`pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br ${glowColor} via-transparent to-transparent opacity-60`}
          aria-hidden
        />
        <div className="relative px-10 py-14 md:px-14 md:py-16">
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
              {badgeLabel}
            </span>
            {!isIntro && !isFinal && paddedLesson && (
              <span className="text-cyan-300">{paddedLesson}</span>
            )}
          </div>
          <h1 className="mt-6 text-3xl font-semibold text-white md:text-4xl">
            {title}
          </h1>
          <div className="mt-10 flex flex-col gap-6 text-slate-200">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}


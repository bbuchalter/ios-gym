interface SkillCardProps {
  icon: string;
  title: string;
  description: string;
}

export function SkillCard({ icon, title, description }: SkillCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 p-6 text-left shadow-xl shadow-slate-950/60 transition duration-500 hover:-translate-y-2 hover:border-cyan-400/40">
      <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-transparent" />
      <div className="relative flex flex-col gap-3">
        <div className="text-4xl">{icon}</div>
        <div>
          <h4 className="text-white text-lg font-semibold">{title}</h4>
          <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
        </div>
        <span className="h-px w-16 bg-gradient-to-r from-cyan-400/60 to-transparent mt-2" />
      </div>
    </div>
  );
}


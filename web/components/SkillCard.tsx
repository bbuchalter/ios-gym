interface SkillCardProps {
  icon: string;
  title: string;
  description: string;
}

export function SkillCard({ icon, title, description }: SkillCardProps) {
  return (
    <div className="group bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl text-center border border-slate-700/50 hover:border-cyan-500/50 hover:-translate-y-2 hover:shadow-xl hover:shadow-cyan-500/20 transition-all duration-300">
      <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h4 className="text-lg text-white mb-2 font-semibold">{title}</h4>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  );
}


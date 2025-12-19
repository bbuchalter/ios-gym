interface SkillCardProps {
  icon: string;
  title: string;
  description: string;
}

export function SkillCard({ icon, title, description }: SkillCardProps) {
  return (
    <div className="bg-dark-bg p-6 rounded-lg text-center border border-border hover:border-primary hover:-translate-y-1 transition-all duration-200">
      <div className="text-5xl mb-2">{icon}</div>
      <h4 className="text-lg text-text-bright mb-2 font-semibold">{title}</h4>
      <p className="text-text-secondary">{description}</p>
    </div>
  );
}


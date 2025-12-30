interface SkillCardProps {
  icon: string;
  title: string;
  description: string;
}

export function SkillCard({ icon, title, description }: SkillCardProps) {
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
      <div className="mb-2 text-3xl">{icon}</div>
      <h4 className="mb-1 text-sm font-semibold text-white">{title}</h4>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
  );
}


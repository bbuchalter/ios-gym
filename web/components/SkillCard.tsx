interface SkillCardProps {
  icon: string;
  title: string;
  description: string;
}

export function SkillCard({ icon, title, description }: SkillCardProps) {
  return (
    <div className="border border-gray-700 bg-gray-800 rounded-lg p-4">
      <div className="text-3xl mb-2">{icon}</div>
      <h4 className="text-white font-semibold mb-1 text-sm">{title}</h4>
      <p className="text-gray-400 text-xs">{description}</p>
    </div>
  );
}


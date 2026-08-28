interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export default function SectionHeader({
  eyebrow,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="mb-6">
      {eyebrow && (
        <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
          {eyebrow}
        </div>
      )}

      <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
        {title}
      </h2>

      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}

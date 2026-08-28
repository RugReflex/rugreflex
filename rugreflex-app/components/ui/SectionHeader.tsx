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
    <div className="mb-5">
      {eyebrow && (
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/30">
          {eyebrow}
        </p>
      )}

      <h2 className="mt-2 text-2xl font-black tracking-tight">
        {title}
      </h2>

      {description && (
        <p className="mt-1 max-w-2xl text-xs leading-5 text-white/25">
          {description}
        </p>
      )}
    </div>
  );
}

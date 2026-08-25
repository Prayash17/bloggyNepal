interface StatCardProps {
  icon: string;
  label: string;
  value: string;
}

export function StatCard({
  icon,
  label,
  value,
}: StatCardProps) {
  return (
    <div className="group h-full rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-2xl transition group-hover:scale-110">
          {icon}
        </span>

        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Fact
        </span>
      </div>

      <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-serif text-xl font-bold leading-tight text-slate-900 sm:text-2xl">
        {value}
      </p>
    </div>
  );
}
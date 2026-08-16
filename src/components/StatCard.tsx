interface StatCardProps {
  icon: string;
  label: string;
  value: string;
}

export function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm transition hover:shadow-md">
      <div className="text-3xl">{icon}</div>
      <p className="mt-2 text-xs uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  iconColor,
}: {
  label: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  iconColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-border-light p-5 card-hover">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-text-secondary">{label}</span>
        <div className={`p-2 rounded-xl bg-bg-tertiary`}>
          <Icon size={18} className={iconColor} />
        </div>
      </div>
      <p className="text-2xl font-bold text-text-primary font-heading">{value}</p>
      {change && <p className="text-xs text-text-tertiary mt-1">{change}</p>}
    </div>
  );
}

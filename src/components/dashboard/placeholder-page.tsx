"use client";

import { Construction } from "lucide-react";

export function PlaceholderPage({
  title,
  description,
  badge,
}: {
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="p-8">
      <div className="flex items-center gap-2 mb-2">
        <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
        {badge && (
          <span className="text-[10px] bg-accent text-white px-1.5 py-0.5 rounded font-medium">
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm text-text-secondary mb-8">{description}</p>

      <div className="bg-white rounded-xl border border-border-light">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Construction size={48} className="text-border mb-4" />
          <h2 className="text-lg font-bold text-text-primary mb-2">
            準備中です
          </h2>
          <p className="text-sm text-text-secondary max-w-md leading-relaxed">
            この機能は現在開発中です。もうしばらくお待ちください。
          </p>
        </div>
      </div>
    </div>
  );
}

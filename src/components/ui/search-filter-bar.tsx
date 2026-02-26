"use client";

import { Search } from "lucide-react";

export function SearchFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "検索...",
  filters,
}: {
  searchValue: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-border-light p-4 mb-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </div>
        {filters}
      </div>
    </div>
  );
}

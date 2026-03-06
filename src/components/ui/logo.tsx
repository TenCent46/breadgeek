import { Wheat } from "lucide-react";

export function Logo({ size = "default" }: { size?: "default" | "small" }) {
  const iconSize = size === "small" ? 20 : 28;
  const textSize = size === "small" ? "text-lg" : "text-xl";

  return (
    <div className="flex items-center gap-2.5">
      <Wheat
        size={iconSize}
        className="text-accent"
        strokeWidth={2}
      />
      <span className={`${textSize} tracking-tight`}>
        <span className="font-display font-semibold text-primary">Bread</span>
        <span className="font-display font-semibold text-accent">Geek</span>
      </span>
    </div>
  );
}

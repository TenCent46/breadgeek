import { Wheat } from "lucide-react";

export function Logo({ size = "default" }: { size?: "default" | "small" }) {
  const iconSize = size === "small" ? 20 : 28;
  const textSize = size === "small" ? "text-lg" : "text-xl";

  return (
    <div className="flex items-center gap-2">
      <Wheat
        size={iconSize}
        className="text-accent"
        strokeWidth={2.2}
      />
      <span className={`${textSize} font-bold tracking-tight text-primary`}>
        BREAD<span className="text-accent">GEEK</span>
      </span>
    </div>
  );
}

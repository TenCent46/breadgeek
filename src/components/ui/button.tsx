"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover focus-visible:ring-primary/30",
  secondary:
    "bg-accent text-white hover:bg-accent/90 focus-visible:ring-accent/30",
  outline:
    "bg-white border border-border text-text-primary hover:bg-bg-secondary focus-visible:ring-primary/20",
  ghost:
    "bg-transparent text-text-secondary hover:bg-bg-tertiary hover:text-text-primary",
  danger:
    "bg-error text-white hover:bg-error/90 focus-visible:ring-error/30",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5 rounded-lg",
  md: "px-4 py-2.5 text-sm gap-2 rounded-xl",
  lg: "px-6 py-3.5 text-base gap-2 rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      children,
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center font-medium
          transition-all duration-150 btn-press
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <Loader2 size={size === "sm" ? 14 : 16} className="animate-spin" />
        ) : icon ? (
          icon
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

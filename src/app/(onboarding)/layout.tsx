"use client";

import { Logo } from "@/components/ui/logo";
import { OnboardingProvider } from "@/lib/onboarding-context";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingProvider>
      <div className="min-h-screen bg-bg-secondary">
        {/* Header */}
        <header className="px-8 py-4">
          <Logo />
        </header>
        {/* Content */}
        {children}
      </div>
    </OnboardingProvider>
  );
}

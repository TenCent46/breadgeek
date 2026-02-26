"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type SocialLink = {
  platform: string;
  username: string;
};

export type OnboardingData = {
  url: string;
  profileImage: string | null;
  activityName: string;
  title: string;
  socialLinks: SocialLink[];
  themeType: "solid" | "gradient" | "image";
  themeColor: string;
};

type OnboardingContextType = {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
};

const defaultData: OnboardingData = {
  url: "",
  profileImage: null,
  activityName: "",
  title: "",
  socialLinks: [],
  themeType: "solid",
  themeColor: "#FFFFFF",
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(defaultData);
  const [currentStep, setCurrentStep] = useState(0);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  return (
    <OnboardingContext.Provider value={{ data, updateData, currentStep, setCurrentStep }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}

"use client";

import { Check } from "lucide-react";

const steps = [
  { label: "URLを決める" },
  { label: "基本情報" },
  { label: "SNS追加" },
  { label: "テーマ選択" },
];

export function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((step, index) => (
        <div key={step.label} className="flex items-center">
          <div className="flex flex-col items-center">
            {/* Circle */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                index < currentStep
                  ? "bg-primary border-primary"
                  : index === currentStep
                  ? "bg-white border-primary border-[3px]"
                  : "bg-white border-border-light"
              }`}
            >
              {index < currentStep ? (
                <Check size={18} className="text-white" strokeWidth={3} />
              ) : index === currentStep ? (
                <div className="w-3 h-3 rounded-full bg-primary" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-text-placeholder" />
              )}
            </div>
            {/* Label */}
            <span
              className={`mt-2 text-sm whitespace-nowrap ${
                index <= currentStep
                  ? "text-text-primary font-medium"
                  : "text-text-tertiary"
              }`}
            >
              {step.label}
            </span>
          </div>

          {/* Connector line */}
          {index < steps.length - 1 && (
            <div className="flex items-center -mt-6 mx-1">
              <div
                className={`w-16 h-0.5 ${
                  index < currentStep
                    ? "bg-primary"
                    : "border-t-2 border-dashed border-border-light bg-transparent"
                }`}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

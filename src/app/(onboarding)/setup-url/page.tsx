"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Stepper } from "@/components/onboarding/stepper";
import { MobilePreview } from "@/components/onboarding/mobile-preview";
import { useOnboarding } from "@/lib/onboarding-context";
import { Check, X, ChevronRight } from "lucide-react";

export default function SetupUrlPage() {
  const router = useRouter();
  const { data, updateData, setCurrentStep } = useOnboarding();
  const [url, setUrl] = useState(data.url);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    setCurrentStep(0);
  }, [setCurrentStep]);

  useEffect(() => {
    if (!url) {
      setIsValid(null);
      return;
    }

    const pattern = /^[a-zA-Z0-9_-]{3,30}$/;
    if (!pattern.test(url)) {
      setIsValid(false);
      return;
    }

    setIsChecking(true);
    const timer = setTimeout(() => {
      // Simulate availability check
      setIsValid(true);
      setIsChecking(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [url]);

  const handleSubmit = () => {
    if (isValid) {
      updateData({ url });
      router.push("/setup-profile");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-72px)]">
      {/* Left: Form */}
      <div className="flex-1 flex flex-col items-center px-8 pt-4">
        <Stepper currentStep={0} />

        <div className="w-full max-w-lg">
          <h1 className="text-3xl font-bold text-text-primary mb-3">
            あなたのURLを決めましょう
          </h1>
          <p className="text-base text-text-secondary mb-10">
            プロフィールリンクの基盤となるURLです。後からも変更可能です。
          </p>

          {/* URL Input */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-text-primary mb-2">
              URL
            </label>
            <div className="flex items-center">
              <div className="bg-bg-secondary border border-border border-r-0 rounded-l-lg px-4 py-3.5 text-sm text-text-tertiary whitespace-nowrap">
                breadgeek.com/
              </div>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full border border-border rounded-r-lg px-4 py-3.5 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-colors"
                  placeholder="your-name"
                  maxLength={30}
                />
                {url && !isChecking && isValid !== null && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isValid ? (
                      <Check size={20} className="text-success" />
                    ) : (
                      <X size={20} className="text-error" />
                    )}
                  </div>
                )}
                {isChecking && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>
            {url && !isChecking && isValid === false && (
              <p className="mt-2 text-sm text-error">
                半角英数字、ハイフン、アンダースコアのみ使用できます（3〜30文字）
              </p>
            )}
            {url && !isChecking && isValid === true && (
              <p className="mt-2 text-sm text-success">
                このURLは使用できます
              </p>
            )}
            <p className="mt-2 text-xs text-text-tertiary">
              {url.length}/30
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={!isValid}
              className="bg-primary text-white px-8 py-3.5 rounded-lg text-base font-medium hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              このURLに決定
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Right: Preview */}
      <MobilePreview />
    </div>
  );
}

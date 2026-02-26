"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Stepper } from "@/components/onboarding/stepper";
import { MobilePreview } from "@/components/onboarding/mobile-preview";
import { useOnboarding } from "@/lib/onboarding-context";
import { Instagram, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";

const SNS_LIST = [
  {
    platform: "instagram",
    name: "Instagram",
    placeholder: "",
    icon: (
      <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shrink-0">
        <Instagram size={20} className="text-white" />
      </div>
    ),
  },
  {
    platform: "x",
    name: "X",
    placeholder: "ユーザーID、またはプロフィールURLを入力...",
    icon: (
      <div className="w-10 h-10 rounded-[10px] bg-black flex items-center justify-center shrink-0">
        <span className="text-white text-lg font-bold">𝕏</span>
      </div>
    ),
  },
  {
    platform: "youtube",
    name: "YouTube",
    placeholder: "@チャンネルID、またはチャンネルURLを入力...",
    icon: (
      <div className="w-10 h-10 rounded-[10px] bg-red-600 flex items-center justify-center shrink-0">
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
          <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
        </svg>
      </div>
    ),
  },
  {
    platform: "line",
    name: "LINE",
    placeholder: "友だち追加URLを入力...",
    icon: (
      <div className="w-10 h-10 rounded-[10px] bg-[#06C755] flex items-center justify-center shrink-0">
        <span className="text-white text-sm font-bold">LINE</span>
      </div>
    ),
  },
  {
    platform: "tiktok",
    name: "TikTok",
    placeholder: "@ユーザーID、またはプロフィールURLを入力...",
    icon: (
      <div className="w-10 h-10 rounded-[10px] bg-black flex items-center justify-center shrink-0">
        <span className="text-white text-sm font-bold">♪</span>
      </div>
    ),
  },
];

export default function SetupSnsPage() {
  const router = useRouter();
  const { data, updateData, setCurrentStep } = useOnboarding();
  const [links, setLinks] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    SNS_LIST.forEach((sns) => {
      const existing = data.socialLinks.find((s) => s.platform === sns.platform);
      initial[sns.platform] = existing?.username || "";
    });
    return initial;
  });

  useEffect(() => {
    setCurrentStep(2);
  }, [setCurrentStep]);

  // Sync to context for real-time preview
  useEffect(() => {
    const socialLinks = Object.entries(links)
      .filter(([, username]) => username.trim() !== "")
      .map(([platform, username]) => ({ platform, username }));
    updateData({ socialLinks });
  }, [links]);

  const handleChange = (platform: string, value: string) => {
    setLinks((prev) => ({ ...prev, [platform]: value }));
  };

  const handleSubmit = () => {
    const socialLinks = Object.entries(links)
      .filter(([, username]) => username.trim() !== "")
      .map(([platform, username]) => ({ platform, username }));
    updateData({ socialLinks });
    router.push("/setup-theme");
  };

  const handleSkip = () => {
    router.push("/setup-theme");
  };

  return (
    <div className="flex min-h-[calc(100vh-72px)]">
      {/* Left: Form */}
      <div className="flex-1 flex flex-col items-center px-8 pt-4">
        <Stepper currentStep={2} />

        <div className="w-full max-w-lg">
          <h1 className="text-3xl font-bold text-text-primary mb-3">
            表示するSNSアカウントを追加しましょう
          </h1>
          <p className="text-base text-text-secondary mb-10 leading-relaxed">
            普段発信しているSNSやサイトを載せると、ゲストがあなたをより深く知ることができます。
          </p>

          {/* SNS List */}
          <div className="relative">
            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2 scrollbar-thin">
              {/* Scroll indicator top */}
              <div className="sticky top-0 flex justify-end pointer-events-none">
                <ChevronUp size={16} className="text-text-tertiary opacity-50" />
              </div>

              {SNS_LIST.map((sns) => (
                <div key={sns.platform} className="flex items-center gap-3">
                  {sns.icon}
                  <input
                    type="text"
                    value={links[sns.platform]}
                    onChange={(e) => handleChange(sns.platform, e.target.value)}
                    placeholder={sns.placeholder}
                    className="flex-1 border border-border rounded-lg px-4 py-3 text-sm placeholder:text-text-placeholder focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-colors"
                  />
                </div>
              ))}

              {/* Scroll indicator bottom */}
              <div className="sticky bottom-0 flex justify-end pointer-events-none">
                <ChevronDown size={16} className="text-text-tertiary opacity-50" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mt-10">
            <button
              onClick={handleSkip}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              スキップ
            </button>
            <button
              onClick={handleSubmit}
              className="bg-primary text-white px-8 py-3.5 rounded-lg text-base font-medium hover:bg-primary-hover transition-colors flex items-center gap-1"
            >
              SNSを追加
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

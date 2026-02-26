"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Stepper } from "@/components/onboarding/stepper";
import { MobilePreview } from "@/components/onboarding/mobile-preview";
import { useOnboarding } from "@/lib/onboarding-context";
import { Palette } from "lucide-react";

const SOLID_COLORS = [
  "#FFFFFF", "#F5F5F5", "#E8E8E8", "#F0EDE8", "#F5F0E0",
  "#D4C5A9", "#C4B69C", "#BFA98A", "#F0E68C", "#F8C8D4",
  "#C8E6C9", "#C8D8E8", "#E0C8E8", "#2C3E50",
];

const GRADIENT_COLORS = [
  { from: "#FF6B6B", to: "#FFA07A" },
  { from: "#667eea", to: "#764ba2" },
  { from: "#f093fb", to: "#f5576c" },
  { from: "#4facfe", to: "#00f2fe" },
  { from: "#43e97b", to: "#38f9d7" },
  { from: "#fa709a", to: "#fee140" },
  { from: "#a18cd1", to: "#fbc2eb" },
  { from: "#fbc2eb", to: "#a6c1ee" },
  { from: "#fdcbf1", to: "#e6dee9" },
  { from: "#a1c4fd", to: "#c2e9fb" },
  { from: "#d4fc79", to: "#96e6a1" },
  { from: "#84fab0", to: "#8fd3f4" },
  { from: "#ffecd2", to: "#fcb69f" },
  { from: "#e0c3fc", to: "#8ec5fc" },
];

type ThemeTab = "solid" | "gradient" | "image";

export default function SetupThemePage() {
  const router = useRouter();
  const { data, updateData, setCurrentStep } = useOnboarding();
  const [activeTab, setActiveTab] = useState<ThemeTab>("solid");
  const [selectedColor, setSelectedColor] = useState(data.themeColor || "#FFFFFF");
  const [customColor, setCustomColor] = useState("#FF6B6B");
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    setCurrentStep(3);
  }, [setCurrentStep]);

  // Sync to context for real-time preview
  useEffect(() => {
    updateData({ themeType: activeTab, themeColor: selectedColor });
  }, [selectedColor, activeTab]);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setShowPicker(false);
  };

  const handleSubmit = () => {
    updateData({ themeType: activeTab, themeColor: selectedColor });
    // Navigate to dashboard or completion
    router.push("/");
  };

  const handleSkip = () => {
    router.push("/");
  };

  return (
    <div className="flex min-h-[calc(100vh-72px)]">
      {/* Left: Form */}
      <div className="flex-1 flex flex-col items-center px-8 pt-4">
        <Stepper currentStep={3} />

        <div className="w-full max-w-lg">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            ページのテーマを選びましょう
          </h1>
          <p className="text-base text-text-secondary mb-2 leading-relaxed">
            あなたの活動に合うデザインをテンプレートから選びます。
          </p>
          <p className="text-base text-text-secondary mb-8">
            後から変更もできます。
          </p>

          {/* Tabs */}
          <div className="flex border-b border-border-light mb-8">
            {(
              [
                { key: "solid", label: "単色", icon: "🔲" },
                { key: "gradient", label: "グラデーション", icon: "🔲" },
                { key: "image", label: "画像", icon: "🖼" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3 text-sm flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-primary font-bold text-text-primary"
                    : "border-transparent text-text-tertiary hover:text-text-secondary"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Solid Colors Grid */}
          {activeTab === "solid" && (
            <div className="grid grid-cols-5 gap-4">
              {SOLID_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  className={`w-full aspect-square rounded-lg border-2 transition-all ${
                    selectedColor === color
                      ? "border-primary scale-105 shadow-md"
                      : "border-border-light hover:border-border"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
              {/* Custom Color Picker */}
              <div className="relative">
                <button
                  onClick={() => setShowPicker(!showPicker)}
                  className={`w-full aspect-square rounded-lg border-2 border-border-light flex items-center justify-center hover:border-border transition-all ${
                    showPicker ? "border-primary" : ""
                  }`}
                >
                  <Palette size={24} className="text-text-tertiary" />
                </button>
                {showPicker && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-border p-4 z-20">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="w-32 h-32 cursor-pointer border-0"
                    />
                    <button
                      onClick={() => handleColorSelect(customColor)}
                      className="mt-2 w-full bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
                    >
                      この色を使用
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Gradient Colors Grid */}
          {activeTab === "gradient" && (
            <div className="grid grid-cols-5 gap-4">
              {GRADIENT_COLORS.map((grad, i) => (
                <button
                  key={i}
                  onClick={() => handleColorSelect(grad.from)}
                  className={`w-full aspect-square rounded-lg border-2 transition-all ${
                    selectedColor === grad.from
                      ? "border-primary scale-105 shadow-md"
                      : "border-border-light hover:border-border"
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${grad.from}, ${grad.to})`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Image Tab */}
          {activeTab === "image" && (
            <div className="text-center py-12 text-text-tertiary">
              <p className="text-base">画像テーマは準備中です</p>
              <p className="text-sm mt-2">後から設定画面で変更できます</p>
            </div>
          )}

          <div className="flex items-center justify-center gap-6 mt-10">
            <button
              onClick={handleSkip}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              スキップ
            </button>
            <button
              onClick={handleSubmit}
              className="bg-primary text-white px-8 py-3.5 rounded-lg text-base font-medium hover:bg-primary-hover transition-colors"
            >
              このテーマで決定
            </button>
          </div>
        </div>
      </div>

      {/* Right: Preview */}
      <MobilePreview />
    </div>
  );
}

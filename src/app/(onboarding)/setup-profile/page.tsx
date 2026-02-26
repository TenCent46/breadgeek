"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Stepper } from "@/components/onboarding/stepper";
import { MobilePreview } from "@/components/onboarding/mobile-preview";
import { useOnboarding } from "@/lib/onboarding-context";
import { User, ChevronRight } from "lucide-react";

export default function SetupProfilePage() {
  const router = useRouter();
  const { data, updateData, setCurrentStep } = useOnboarding();
  const [activityName, setActivityName] = useState(data.activityName);
  const [title, setTitle] = useState(data.title);
  const [profileImage, setProfileImage] = useState<string | null>(data.profileImage);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentStep(1);
  }, [setCurrentStep]);

  // Sync to context for real-time preview
  useEffect(() => {
    updateData({ activityName, title, profileImage });
  }, [activityName, title, profileImage]);

  const handleImageUpload = (file: File) => {
    if (file.size > 100 * 1024 * 1024) {
      alert("ファイルサイズは100MB以下にしてください");
      return;
    }
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("jpg, png, webp形式のファイルを選択してください");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSubmit = () => {
    updateData({ activityName, title, profileImage });
    router.push("/setup-sns");
  };

  return (
    <div className="flex min-h-[calc(100vh-72px)]">
      {/* Left: Form */}
      <div className="flex-1 flex flex-col items-center px-8 pt-4">
        <Stepper currentStep={1} />

        <div className="w-full max-w-lg">
          <h1 className="text-3xl font-bold text-text-primary mb-3">
            プロフィールを作りましょう
          </h1>
          <p className="text-base text-text-secondary mb-10">
            プロフィールは後からも変更可能です。
          </p>

          {/* Profile Photo */}
          <div className="mb-8">
            <h2 className="text-base font-bold text-text-primary mb-3">
              プロフィール写真
            </h2>
            <div className="flex items-start gap-8">
              <div className="text-sm text-text-tertiary leading-relaxed">
                <p>ドラッグ＆ドロップ、</p>
                <p>またはファイルを選択できます。</p>
                <p className="mt-2">形式: jpg, png, webp</p>
                <p>推奨サイズ: 1280 x 1280 px</p>
                <p>ファイル容量: 最大100MB</p>
              </div>
              <div
                ref={dropZoneRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="w-[120px] h-[120px] rounded-full bg-[#E8E8E8] flex items-center justify-center cursor-pointer hover:bg-[#D8D8D8] transition-colors overflow-hidden shrink-0"
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={48} className="text-[#BDBDBD]" />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />
            </div>
          </div>

          {/* Activity Name */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-base font-bold text-text-primary">
                活動名
              </label>
              <span className="text-sm text-text-tertiary">
                {activityName.length}/50
              </span>
            </div>
            <input
              type="text"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value.slice(0, 50))}
              className="w-full border border-border rounded-lg px-4 py-3.5 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-colors"
              maxLength={50}
            />
          </div>

          {/* Title / Catchcopy */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-2">
              <label className="text-base font-bold text-text-primary">
                肩書・キャッチコピーなど
              </label>
              <span className="text-sm text-text-tertiary">
                {title.length}/50
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 50))}
              placeholder="あなたの活動内容を入力..."
              className="w-full border border-border rounded-lg px-4 py-3.5 text-base placeholder:text-text-placeholder focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-colors"
              maxLength={50}
            />
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              className="bg-primary text-white px-8 py-3.5 rounded-lg text-base font-medium hover:bg-primary-hover transition-colors flex items-center gap-1"
            >
              この内容で作成
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

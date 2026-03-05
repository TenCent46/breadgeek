"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Stepper } from "@/components/onboarding/stepper";
import { MobilePreview } from "@/components/onboarding/mobile-preview";
import { useOnboarding } from "@/lib/onboarding-context";
import { User, ChevronRight, Loader2 } from "lucide-react";

export default function SetupProfilePage() {
  const router = useRouter();
  const { data, updateData, setCurrentStep } = useOnboarding();
  const [activityName, setActivityName] = useState(data.activityName);
  const [title, setTitle] = useState(data.title);
  const [previewImage, setPreviewImage] = useState<string | null>(data.profileImage);
  const [uploading, setUploading] = useState(false);
  const uploadedUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentStep(1);
  }, [setCurrentStep]);

  useEffect(() => {
    updateData({ activityName, title, profileImage: previewImage });
  }, [activityName, title, previewImage]);

  const handleImageUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("ファイルサイズは5MB以下にしてください");
      return;
    }
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("jpg, png, webp形式のファイルを選択してください");
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Vercel Blob
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "profiles");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const { url } = await res.json();
        uploadedUrlRef.current = url;
      }
    } catch {
      // Fallback: keep the data URL
    } finally {
      setUploading(false);
    }
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
    // Use blob URL if available, otherwise keep the preview data URL
    const imageUrl = uploadedUrlRef.current || previewImage;
    updateData({ activityName, title, profileImage: imageUrl });
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
                <p>ファイル容量: 最大5MB</p>
              </div>
              <div
                ref={dropZoneRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="w-[120px] h-[120px] rounded-full bg-[#E8E8E8] flex items-center justify-center cursor-pointer hover:bg-[#D8D8D8] transition-colors overflow-hidden shrink-0 relative"
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={48} className="text-[#BDBDBD]" />
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                    <Loader2 size={24} className="text-white animate-spin" />
                  </div>
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
              disabled={uploading}
              className="bg-primary text-white px-8 py-3.5 rounded-lg text-base font-medium hover:bg-primary-hover transition-colors flex items-center gap-1 disabled:opacity-40"
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

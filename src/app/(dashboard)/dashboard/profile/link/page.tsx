"use client";

import { useState } from "react";
import { Plus, X, Smartphone } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";

const snsOptions = [
  "Instagram",
  "X (Twitter)",
  "YouTube",
  "LINE",
  "TikTok",
  "Facebook",
  "ウェブサイト",
];

interface SnsLink {
  id: string;
  platform: string;
  url: string;
}

export default function ProfileLinkPage() {
  const { services } = useDashboard();

  const [schoolName, setSchoolName] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [snsLinks, setSnsLinks] = useState<SnsLink[]>([]);
  const [isPublished, setIsPublished] = useState(true);
  const [saved, setSaved] = useState(false);

  function toggleService(id: string) {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function addSnsLink() {
    setSnsLinks((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2, 10),
        platform: "Instagram",
        url: "",
      },
    ]);
  }

  function updateSnsLink(
    id: string,
    field: "platform" | "url",
    value: string
  ) {
    setSnsLinks((prev) =>
      prev.map((link) =>
        link.id === id ? { ...link, [field]: value } : link
      )
    );
  }

  function removeSnsLink(id: string) {
    setSnsLinks((prev) => prev.filter((link) => link.id !== id));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const selectedServiceTitles = services
    .filter((s) => selectedServices.includes(s.id))
    .map((s) => s.title);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            プロフィールリンク
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            教室の紹介ページを作成・公開できます
          </p>
        </div>
        <button
          onClick={handleSave}
          className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          {saved ? "保存しました" : "保存する"}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Left Panel - Form */}
        <div className="flex-1 space-y-4">
          {/* Publish toggle */}
          <div className="bg-white rounded-xl border border-border-light p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text-primary">
                ステータス
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPublished(true)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isPublished
                      ? "bg-primary text-white"
                      : "text-text-secondary hover:bg-bg-secondary"
                  }`}
                >
                  公開
                </button>
                <button
                  onClick={() => setIsPublished(false)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    !isPublished
                      ? "bg-primary text-white"
                      : "text-text-secondary hover:bg-bg-secondary"
                  }`}
                >
                  下書き
                </button>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl border border-border-light p-6 space-y-6">
            {/* School Name */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                教室名 <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="例: 天然酵母パン教室 ふわり"
                className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>

            {/* Introduction */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                紹介文
                <span className="text-xs text-text-tertiary ml-2">
                  (最大300文字)
                </span>
              </label>
              <textarea
                value={introduction}
                onChange={(e) => {
                  if (e.target.value.length <= 300)
                    setIntroduction(e.target.value);
                }}
                placeholder="教室の紹介文を入力してください"
                rows={5}
                className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 resize-none"
              />
              <div className="flex justify-end mt-1">
                <span
                  className={`text-xs ${
                    introduction.length > 270
                      ? introduction.length >= 300
                        ? "text-error"
                        : "text-warning"
                      : "text-text-tertiary"
                  }`}
                >
                  {introduction.length}/300
                </span>
              </div>
            </div>

            {/* Recommended Lessons (checkboxes from services) */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                おすすめレッスン
              </label>
              {services.length === 0 ? (
                <p className="text-sm text-text-tertiary py-2">
                  レッスン（サービス）がまだ登録されていません
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-lg p-3">
                  {services.map((service) => (
                    <label
                      key={service.id}
                      className="flex items-center gap-3 cursor-pointer py-1.5 px-2 rounded-lg hover:bg-bg-secondary transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service.id)}
                        onChange={() => toggleService(service.id)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                      />
                      <span className="text-sm text-text-primary">
                        {service.title}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* SNS Links */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                SNSリンク
              </label>
              <div className="space-y-3">
                {snsLinks.map((link) => (
                  <div key={link.id} className="flex items-center gap-3">
                    <select
                      value={link.platform}
                      onChange={(e) =>
                        updateSnsLink(link.id, "platform", e.target.value)
                      }
                      className="w-40 shrink-0 border border-border rounded-lg px-3 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                    >
                      {snsOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) =>
                        updateSnsLink(link.id, "url", e.target.value)
                      }
                      placeholder="https://"
                      className="flex-1 border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                    />
                    <button
                      onClick={() => removeSnsLink(link.id)}
                      className="p-2.5 rounded-lg hover:bg-error/10 transition-colors shrink-0"
                    >
                      <X size={16} className="text-error" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addSnsLink}
                className="mt-3 flex items-center gap-1.5 text-sm text-accent hover:text-accent/80 transition-colors"
              >
                <Plus size={16} />
                SNSを追加
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Mobile Preview */}
        <div className="w-80 shrink-0">
          <div className="sticky top-8">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone size={16} className="text-text-tertiary" />
              <h2 className="text-sm font-bold text-text-primary">
                プレビュー
              </h2>
            </div>
            <div className="bg-white rounded-xl border border-border-light p-4">
              {/* Phone frame */}
              <div className="mx-auto w-64 rounded-[2rem] border-4 border-gray-800 bg-gradient-to-b from-amber-50 to-orange-50 overflow-hidden shadow-inner">
                {/* Notch */}
                <div className="flex justify-center pt-2 pb-3">
                  <div className="w-20 h-5 bg-gray-800 rounded-full" />
                </div>

                {/* Content */}
                <div className="px-4 pb-6 space-y-3 min-h-[400px]">
                  {/* Profile header */}
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-white/60 mx-auto mb-2 flex items-center justify-center">
                      <span className="text-2xl">🍞</span>
                    </div>
                    <div className="text-xs font-bold text-gray-800">
                      {schoolName || "教室名"}
                    </div>
                    {!isPublished && (
                      <div className="mt-1 inline-block text-[8px] bg-gray-300 text-gray-600 px-1.5 py-0.5 rounded">
                        下書き
                      </div>
                    )}
                  </div>

                  {/* Introduction */}
                  {introduction && (
                    <p className="text-[10px] text-gray-600 leading-relaxed text-center">
                      {introduction.length > 80
                        ? introduction.slice(0, 80) + "..."
                        : introduction}
                    </p>
                  )}

                  {/* Recommended lessons */}
                  {selectedServiceTitles.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                        おすすめレッスン
                      </div>
                      {selectedServiceTitles.slice(0, 3).map((title) => (
                        <div
                          key={title}
                          className="w-full bg-white/80 rounded-lg px-3 py-2 text-center border border-white/60 shadow-sm"
                        >
                          <span className="text-[10px] font-medium text-gray-700">
                            {title}
                          </span>
                        </div>
                      ))}
                      {selectedServiceTitles.length > 3 && (
                        <div className="text-[9px] text-gray-400 text-center">
                          +{selectedServiceTitles.length - 3} more
                        </div>
                      )}
                    </div>
                  )}

                  {/* SNS icons */}
                  {snsLinks.length > 0 && (
                    <div className="flex justify-center gap-2 pt-2">
                      {snsLinks.map((link) => (
                        <div
                          key={link.id}
                          className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center border border-white/60 shadow-sm text-[10px] text-gray-500"
                        >
                          {link.platform[0]}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom bar */}
                <div className="flex justify-center pb-2">
                  <div className="w-24 h-1 bg-gray-800 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

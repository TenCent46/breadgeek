"use client";

import { useState } from "react";
import { Camera, Plus, X } from "lucide-react";

const categoryOptions = [
  "パン教室",
  "料理教室",
  "お菓子教室",
  "その他",
];

const prefectureOptions = [
  "東京都",
  "大阪府",
  "神奈川県",
  "愛知県",
  "福岡県",
  "北海道",
  "京都府",
  "兵庫県",
  "埼玉県",
  "千葉県",
  "広島県",
  "宮城県",
];

const snsPlaftormOptions = [
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

interface ProfileEditClientProps {
  school: {
    id: string;
    name: string;
    description: string | null;
    location: string | null;
    imageUrl: string | null;
  };
  userName: string;
  userEmail: string;
}

export function ProfileEditClient({
  school,
  userName: initialUserName,
  userEmail: initialUserEmail,
}: ProfileEditClientProps) {
  const [displayName, setDisplayName] = useState(initialUserName || "あなたの名前");
  const [title, setTitle] = useState("パン教室主宰");
  const [bio, setBio] = useState(
    school.description ||
    "天然酵母と国産小麦にこだわったパン教室を運営しています。初心者の方も大歓迎です。"
  );
  const [schoolFeatures, setSchoolFeatures] = useState("");
  const [tags, setTags] = useState<string[]>([
    "天然酵母",
    "国産小麦",
    "パン教室",
    "初心者歓迎",
  ]);
  const [tagInput, setTagInput] = useState("");
  const [category, setCategory] = useState("パン教室");
  const [prefecture, setPrefecture] = useState("東京都");
  const [city, setCity] = useState(school.location || "渋谷区");
  const [email, setEmail] = useState(initialUserEmail || "example@breadgeek.com");
  const [phone, setPhone] = useState("090-1234-5678");
  const [snsLinks, setSnsLinks] = useState<SnsLink[]>([
    { id: "1", platform: "Instagram", url: "https://instagram.com/example" },
    { id: "2", platform: "YouTube", url: "https://youtube.com/@example" },
  ]);
  const [saved, setSaved] = useState(false);

  function handleAddTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = tagInput.trim();
      if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
        setTags((prev) => [...prev, trimmed]);
        setTagInput("");
      }
    }
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
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

  function updateSnsLink(id: string, field: "platform" | "url", value: string) {
    setSnsLinks((prev) =>
      prev.map((link) => (link.id === id ? { ...link, [field]: value } : link))
    );
  }

  function removeSnsLink(id: string) {
    setSnsLinks((prev) => prev.filter((link) => link.id !== id));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            プロフィール編集
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            あなたのプロフィール情報を編集します
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white rounded-xl border border-border-light p-6 space-y-8">
          {/* Profile Image */}
          <div className="flex flex-col items-center">
            <div className="relative mb-3">
              <div className="w-[100px] h-[100px] rounded-full bg-bg-secondary flex items-center justify-center overflow-hidden">
                <span className="text-4xl">👤</span>
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-white cursor-pointer">
                <Camera size={14} className="text-white" />
              </div>
            </div>
            <button className="text-sm text-accent hover:underline">
              画像を変更
            </button>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              表示名 <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="表示名を入力"
              required
              className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              肩書き
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: パン教室主宰"
              className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              自己紹介
            </label>
            <textarea
              value={bio}
              onChange={(e) => {
                if (e.target.value.length <= 500) setBio(e.target.value);
              }}
              placeholder="自己紹介を入力してください"
              rows={4}
              className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 resize-none"
            />
            <div className="flex justify-end mt-1">
              <span
                className={`text-xs ${
                  bio.length > 450
                    ? bio.length >= 500
                      ? "text-error"
                      : "text-warning"
                    : "text-text-tertiary"
                }`}
              >
                {bio.length}/500
              </span>
            </div>
          </div>

          {/* School Features */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              教室の特徴
              <span className="text-xs text-text-tertiary ml-2">
                (最大500文字)
              </span>
            </label>
            <textarea
              value={schoolFeatures}
              onChange={(e) => {
                if (e.target.value.length <= 500)
                  setSchoolFeatures(e.target.value);
              }}
              placeholder="教室の特徴やこだわりを入力してください（例: 天然酵母100%使用、少人数制、国産小麦にこだわり...）"
              rows={4}
              className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 resize-none"
            />
            <div className="flex justify-end mt-1">
              <span
                className={`text-xs ${
                  schoolFeatures.length > 450
                    ? schoolFeatures.length >= 500
                      ? "text-error"
                      : "text-warning"
                    : "text-text-tertiary"
                }`}
              >
                {schoolFeatures.length}/500
              </span>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              専門分野タグ
              <span className="text-xs text-text-tertiary ml-2">
                (最大10個)
              </span>
            </label>
            <div className="border border-border rounded-lg px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-medium"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={
                  tags.length >= 10
                    ? "タグの上限に達しました"
                    : "タグを入力してEnterで追加"
                }
                disabled={tags.length >= 10}
                className="w-full text-sm outline-none bg-transparent py-1 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              カテゴリ
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            >
              {categoryOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              所在地
            </label>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={prefecture}
                onChange={(e) => setPrefecture(e.target.value)}
                className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              >
                <option value="">都道府県を選択</option>
                {prefectureOptions.map((pref) => (
                  <option key={pref} value={pref}>
                    {pref}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="市区町村"
                className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              電話番号
              <span className="text-xs text-text-tertiary ml-2">(任意)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="090-0000-0000"
              className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
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
                    {snsPlaftormOptions.map((opt) => (
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

          {/* Save button */}
          <div className="pt-4 border-t border-border-light">
            <button
              onClick={handleSave}
              className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              {saved ? "保存しました" : "変更を保存する"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

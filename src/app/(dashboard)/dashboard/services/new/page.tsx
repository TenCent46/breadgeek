"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  BookOpen,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Check,
  Clock,
  UtensilsCrossed,
} from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";
import { Badge } from "@/components/ui/badge";
import type { ServiceType, ServiceStatus } from "@/lib/types";

const serviceTypes = [
  {
    id: "group-lesson" as ServiceType,
    title: "グループレッスン",
    description:
      "少人数制のパン作り教室。食パン、ハード系、菓子パンなど多彩なレッスンに対応",
    icon: Users,
    color: "bg-blue-50 text-blue-600",
  },
  {
    id: "master-course" as ServiceType,
    title: "マスターコース",
    description:
      "複数回にわたる本格的なパン作りコース。天然酵母や製パン技術を体系的に学べます",
    icon: BookOpen,
    color: "bg-purple-50 text-purple-600",
  },
  {
    id: "trial-lesson" as ServiceType,
    title: "体験レッスン",
    description:
      "初めての方向けのお試しレッスン。気軽にパン作りの楽しさを体験できます",
    icon: Sparkles,
    color: "bg-green-50 text-green-600",
  },
];

const categories = [
  "食パン系",
  "ハード系",
  "菓子パン系",
  "天然酵母",
  "季節限定",
  "その他",
];

const stepLabels = [
  "タイプ選択",
  "基本情報",
  "料金設定",
  "スケジュール",
  "設定",
  "確認",
];

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3400-\u4dbf\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function NewServicePage() {
  const router = useRouter();
  const { addService, recipes } = useDashboard();

  const [step, setStep] = useState(0);

  // Step 0: type
  const [selectedType, setSelectedType] = useState<ServiceType | null>(null);

  // Step 1: basic info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [linkedRecipeId, setLinkedRecipeId] = useState("");

  // Step 2: pricing
  const [price, setPrice] = useState<number>(0);
  const [cancellationPolicy, setCancellationPolicy] = useState("");

  // Step 3: schedule
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [capacity, setCapacity] = useState<number>(6);
  const [duration, setDuration] = useState<number>(120);
  const [location, setLocation] = useState("");
  const [sessions, setSessions] = useState<number>(4);

  // Step 4: settings
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<ServiceStatus>("draft");

  const totalSteps = stepLabels.length;

  function canProceed(): boolean {
    switch (step) {
      case 0:
        return !!selectedType;
      case 1:
        return title.trim().length > 0;
      case 2:
        return price >= 0;
      case 3:
        return true;
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  }

  function handleNext() {
    if (step === 0 && selectedType) {
      setStep(1);
    } else if (step < totalSteps - 1) {
      if (step === 1 && !slug) {
        setSlug(toSlug(title));
      }
      setStep(step + 1);
    }
  }

  function handleBack() {
    if (step > 0) setStep(step - 1);
  }

  function handleCreate() {
    if (!selectedType) return;

    addService({
      type: selectedType,
      title,
      description,
      price,
      status,
      images: [],
      capacity,
      duration,
      location: location || undefined,
      linkedRecipeId: linkedRecipeId || undefined,
      schedules:
        eventDate
          ? [
              {
                id: Math.random().toString(36).slice(2, 10),
                date: eventDate,
                startTime,
                endTime,
                spotsTotal: capacity,
                spotsTaken: 0,
              },
            ]
          : [],
      category,
    });

    router.push("/dashboard/services");
  }

  const typeInfo = selectedType
    ? serviceTypes.find((t) => t.id === selectedType)
    : null;

  const linkedRecipe = linkedRecipeId
    ? recipes.find((r) => r.id === linkedRecipeId)
    : null;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Back link */}
      <Link
        href="/dashboard/services"
        className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        レッスン一覧に戻る
      </Link>

      <h1 className="text-2xl font-bold text-text-primary mb-6">
        新規レッスン作成
      </h1>

      {/* Step indicator */}
      {step > 0 && (
        <div className="flex items-center gap-1 mb-8">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex items-center gap-1">
              <button
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  i === step
                    ? "bg-primary text-white"
                    : i < step
                    ? "bg-primary/10 text-primary cursor-pointer hover:bg-primary/20"
                    : "bg-bg-secondary text-text-placeholder"
                }`}
              >
                {i < step ? (
                  <Check size={12} />
                ) : (
                  <span>{i + 1}</span>
                )}
                {label}
              </button>
              {i < totalSteps - 1 && (
                <ChevronRight
                  size={14}
                  className="text-text-placeholder mx-0.5"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Step 0: Type Selection */}
      {step === 0 && (
        <>
          <p className="text-base text-text-secondary mb-8">
            作成するレッスンのタイプを選択してください
          </p>
          <div className="space-y-3">
            {serviceTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left ${
                  selectedType === type.id
                    ? "border-primary bg-white shadow-sm"
                    : "border-border-light bg-white hover:border-border"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl ${type.color} flex items-center justify-center shrink-0`}
                >
                  <type.icon size={22} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-text-primary mb-1">
                    {type.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {type.description}
                  </p>
                </div>
                <ChevronRight
                  size={20}
                  className="text-text-tertiary shrink-0"
                />
              </button>
            ))}
          </div>
        </>
      )}

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-border-light p-6">
          <h2 className="text-lg font-bold text-text-primary mb-6">
            基本情報
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                レッスン名 <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例: もちふわ食パンレッスン"
                className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                説明
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="レッスンの詳細を入力してください"
                rows={4}
                className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                カテゴリー
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                リンクするレシピ
              </label>
              <div className="relative">
                <select
                  value={linkedRecipeId}
                  onChange={(e) => setLinkedRecipeId(e.target.value)}
                  className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                >
                  <option value="">レシピを選択（任意）</option>
                  {recipes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}（材料費: ¥{r.costPerServing.toLocaleString()}/人）
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-text-tertiary mt-1.5">
                レシピをリンクすると、材料費の自動計算が可能になります
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Pricing */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-border-light p-6">
          <h2 className="text-lg font-bold text-text-primary mb-6">
            料金設定
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                受講料 (税込)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
                  ¥
                </span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) =>
                    setPrice(Math.max(0, parseInt(e.target.value) || 0))
                  }
                  min={0}
                  className="w-full border border-border rounded-lg pl-8 pr-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                />
              </div>
              {linkedRecipe && (
                <p className="text-xs text-accent mt-1.5">
                  リンク済みレシピの材料費: ¥{linkedRecipe.costPerServing.toLocaleString()}/人
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                キャンセルポリシー
              </label>
              <textarea
                value={cancellationPolicy}
                onChange={(e) => setCancellationPolicy(e.target.value)}
                placeholder="例: 前日までのキャンセルは全額返金。当日キャンセルは返金不可。"
                rows={3}
                className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Schedule */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-border-light p-6">
          <h2 className="text-lg font-bold text-text-primary mb-6">
            スケジュール設定
          </h2>

          <div className="space-y-5">
            {/* Common fields for all types */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  定員
                </label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) =>
                    setCapacity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  min={1}
                  className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  所要時間（分）
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) =>
                      setDuration(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    min={1}
                    className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                  />
                  <Clock
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                開催場所
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="例: 自宅キッチン / レンタルスペース渋谷"
                className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>

            {/* Master course sessions count */}
            {selectedType === "master-course" && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  全回数
                </label>
                <input
                  type="number"
                  value={sessions}
                  onChange={(e) =>
                    setSessions(Math.max(2, parseInt(e.target.value) || 2))
                  }
                  min={2}
                  className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                />
                <p className="text-xs text-text-tertiary mt-1.5">
                  コース全体の回数を設定してください（最低2回）
                </p>
              </div>
            )}

            {/* First session date */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                {selectedType === "master-course" ? "初回開催日" : "開催日"}
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  開始時間
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  終了時間
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Settings */}
      {step === 4 && (
        <div className="bg-white rounded-xl border border-border-light p-6">
          <h2 className="text-lg font-bold text-text-primary mb-6">設定</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                URL スラッグ
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="例: mochifuwa-shokupan"
                className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
              <p className="text-xs text-text-tertiary mt-1.5">
                yoursite.com/services/{slug || "xxx"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                公開ステータス
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ServiceStatus)}
                className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              >
                <option value="draft">下書き</option>
                <option value="published">公開</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Review */}
      {step === 5 && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-border-light p-6">
            <h2 className="text-lg font-bold text-text-primary mb-4">
              作成内容の確認
            </h2>

            <div className="divide-y divide-border-light">
              {/* Type row */}
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-text-secondary">タイプ</span>
                <div className="flex items-center gap-2">
                  {typeInfo && (
                    <div
                      className={`w-6 h-6 rounded ${typeInfo.color} flex items-center justify-center`}
                    >
                      <typeInfo.icon size={14} />
                    </div>
                  )}
                  <Badge status={selectedType || ""} />
                </div>
              </div>

              {/* Title row */}
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-text-secondary">
                  レッスン名
                </span>
                <span className="text-sm font-medium text-text-primary">
                  {title}
                </span>
              </div>

              {/* Category row */}
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-text-secondary">カテゴリー</span>
                <span className="text-sm text-text-primary">{category}</span>
              </div>

              {/* Linked Recipe */}
              {linkedRecipe && (
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-text-secondary">リンクレシピ</span>
                  <span className="flex items-center gap-1.5 text-sm text-accent">
                    <UtensilsCrossed size={14} />
                    {linkedRecipe.name}
                  </span>
                </div>
              )}

              {/* Description row */}
              {description && (
                <div className="py-3">
                  <span className="text-sm text-text-secondary block mb-1">
                    説明
                  </span>
                  <p className="text-sm text-text-primary leading-relaxed">
                    {description}
                  </p>
                </div>
              )}

              {/* Price row */}
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-text-secondary">受講料</span>
                <span className="text-sm font-bold text-text-primary">
                  ¥{price.toLocaleString()}
                </span>
              </div>

              {/* Capacity */}
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-text-secondary">定員</span>
                <span className="text-sm text-text-primary">{capacity}名</span>
              </div>

              {/* Duration */}
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-text-secondary">所要時間</span>
                <span className="text-sm text-text-primary">{duration}分</span>
              </div>

              {/* Location */}
              {location && (
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-text-secondary">場所</span>
                  <span className="text-sm text-text-primary">{location}</span>
                </div>
              )}

              {/* Sessions for master course */}
              {selectedType === "master-course" && (
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-text-secondary">全回数</span>
                  <span className="text-sm text-text-primary">全{sessions}回</span>
                </div>
              )}

              {/* Schedule info */}
              {eventDate && (
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-text-secondary">
                    {selectedType === "master-course" ? "初回日程" : "開催日"}
                  </span>
                  <span className="text-sm text-text-primary">
                    {eventDate} {startTime}〜{endTime}
                  </span>
                </div>
              )}

              {/* Slug row */}
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-text-secondary">URL</span>
                <span className="text-sm text-text-tertiary">
                  /services/{slug}
                </span>
              </div>

              {/* Status row */}
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-text-secondary">ステータス</span>
                <Badge status={status} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-8">
        {step > 0 ? (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 border border-border rounded-lg px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
          >
            <ChevronLeft size={16} />
            戻る
          </button>
        ) : (
          <div />
        )}

        {step < totalSteps - 1 ? (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            次へ進む
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            <Check size={16} />
            作成する
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Users,
  BookOpen,
  Sparkles,
  Clock,
  Plus,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";
import { Badge } from "@/components/ui/badge";
import type { ServiceType, ServiceStatus, ServiceSchedule } from "@/lib/types";

const categories = [
  "食パン系",
  "ハード系",
  "菓子パン系",
  "天然酵母",
  "季節限定",
  "その他",
];

const typeConfig: Record<
  ServiceType,
  { label: string; icon: typeof Users; color: string }
> = {
  "group-lesson": {
    label: "グループレッスン",
    icon: Users,
    color: "bg-blue-50 text-blue-600",
  },
  "master-course": {
    label: "マスターコース",
    icon: BookOpen,
    color: "bg-purple-50 text-purple-600",
  },
  "trial-lesson": {
    label: "体験レッスン",
    icon: Sparkles,
    color: "bg-green-50 text-green-600",
  },
};

export default function EditServicePage() {
  const params = useParams();
  const router = useRouter();
  const { services, updateService, recipes } = useDashboard();
  const id = params.id as string;

  const service = services.find((s) => s.id === id);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [price, setPrice] = useState<number>(0);
  const [status, setStatus] = useState<ServiceStatus>("draft");
  const [capacity, setCapacity] = useState<number>(6);
  const [duration, setDuration] = useState<number>(120);
  const [location, setLocation] = useState("");
  const [schedules, setSchedules] = useState<ServiceSchedule[]>([]);
  const [cancellationPolicy, setCancellationPolicy] = useState("");
  const [linkedRecipeId, setLinkedRecipeId] = useState("");

  // Load service data into form
  useEffect(() => {
    if (service) {
      setTitle(service.title);
      setDescription(service.description);
      setCategory(service.category);
      setPrice(service.price);
      setStatus(service.status);
      setCapacity(service.capacity || 6);
      setDuration(service.duration || 120);
      setLocation(service.location || "");
      setSchedules(service.schedules);
      setLinkedRecipeId(service.linkedRecipeId || "");
    }
  }, [service]);

  if (!service) {
    return (
      <div className="p-8">
        <Link
          href="/dashboard/services"
          className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          レッスン一覧に戻る
        </Link>
        <div className="bg-white rounded-xl border border-border-light p-6">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg font-bold text-text-primary mb-2">
              レッスンが見つかりません
            </p>
            <p className="text-sm text-text-secondary mb-4">
              指定されたレッスンは存在しないか、削除された可能性があります。
            </p>
            <Link
              href="/dashboard/services"
              className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              レッスン一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tc = typeConfig[service.type];
  const TypeIcon = tc.icon;

  const linkedRecipe = linkedRecipeId
    ? recipes.find((r) => r.id === linkedRecipeId)
    : null;

  function handleAddSchedule() {
    setSchedules((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2, 10),
        date: "",
        startTime: "",
        endTime: "",
        spotsTotal: capacity,
        spotsTaken: 0,
      },
    ]);
  }

  function handleUpdateSchedule(
    index: number,
    field: keyof ServiceSchedule,
    value: string | number
  ) {
    setSchedules((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  }

  function handleRemoveSchedule(index: number) {
    setSchedules((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSave() {
    if (!service) return;
    updateService(id, {
      title,
      description,
      category,
      price,
      status,
      capacity,
      duration,
      location: location || undefined,
      linkedRecipeId: linkedRecipeId || undefined,
      schedules,
    });

    router.push("/dashboard/services");
  }

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

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg ${tc.color} flex items-center justify-center`}
          >
            <TypeIcon size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              レッスンを編集
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge status={service.type} />
              <span className="text-xs text-text-tertiary">
                作成日: {service.createdAt}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <Save size={16} />
          保存する
        </button>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-border-light p-6 mb-4">
        <h2 className="text-lg font-bold text-text-primary mb-6">基本情報</h2>
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
            {linkedRecipe && (
              <div className="flex items-center gap-1.5 text-xs text-accent mt-1.5">
                <UtensilsCrossed size={12} />
                <span>
                  材料費: ¥{linkedRecipe.costPerServing.toLocaleString()}/人 |
                  合計: ¥{linkedRecipe.totalCost.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-xl border border-border-light p-6 mb-4">
        <h2 className="text-lg font-bold text-text-primary mb-6">料金設定</h2>
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

      {/* Schedule section */}
      <div className="bg-white rounded-xl border border-border-light p-6 mb-4">
        <h2 className="text-lg font-bold text-text-primary mb-6">
          スケジュール設定
        </h2>

        <div className="space-y-5">
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

          {/* Schedule list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-text-primary">
                スケジュール一覧
              </label>
              <button
                onClick={handleAddSchedule}
                className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-hover transition-colors"
              >
                <Plus size={14} />
                追加
              </button>
            </div>
            {schedules.length === 0 && (
              <p className="text-sm text-text-tertiary py-4 text-center">
                スケジュールが登録されていません
              </p>
            )}
            <div className="space-y-3">
              {schedules.map((schedule, index) => (
                <div
                  key={schedule.id}
                  className="flex items-center gap-3 p-3 bg-bg-secondary rounded-lg"
                >
                  <input
                    type="date"
                    value={schedule.date}
                    onChange={(e) =>
                      handleUpdateSchedule(index, "date", e.target.value)
                    }
                    className="border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                  <input
                    type="time"
                    value={schedule.startTime}
                    onChange={(e) =>
                      handleUpdateSchedule(
                        index,
                        "startTime",
                        e.target.value
                      )
                    }
                    className="border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none w-28"
                  />
                  <span className="text-text-tertiary text-sm">〜</span>
                  <input
                    type="time"
                    value={schedule.endTime}
                    onChange={(e) =>
                      handleUpdateSchedule(index, "endTime", e.target.value)
                    }
                    className="border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none w-28"
                  />
                  <span className="text-xs text-text-tertiary">
                    {schedule.spotsTaken}/{schedule.spotsTotal}名
                  </span>
                  <button
                    onClick={() => handleRemoveSchedule(index)}
                    className="p-1.5 text-error hover:bg-error/5 rounded transition-colors ml-auto"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="bg-white rounded-xl border border-border-light p-6 mb-4">
        <h2 className="text-lg font-bold text-text-primary mb-6">
          公開設定
        </h2>
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
            <option value="archived">アーカイブ</option>
          </select>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between mt-8">
        <Link
          href="/dashboard/services"
          className="flex items-center gap-2 border border-border rounded-lg px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
        >
          <ArrowLeft size={16} />
          戻る
        </Link>
        <button
          onClick={handleSave}
          disabled={!title.trim()}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Save size={16} />
          保存する
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  LayoutGrid,
  List,
  Users,
  BookOpen,
  Sparkles,
  Edit3,
  Copy,
  Trash2,
  Clock,
  MapPin,
  Calendar,
  UtensilsCrossed,
} from "lucide-react";
import { addService, deleteService } from "@/lib/actions";
import { Badge } from "@/components/ui/badge";
import { SearchFilterBar } from "@/components/ui/search-filter-bar";
import { Modal } from "@/components/ui/modal";
import type { Service, ServiceType, ServiceStatus, Recipe } from "@/lib/types";

const typeConfig: Record<
  ServiceType,
  { label: string; icon: typeof Users; colorClass: string; iconBg: string }
> = {
  "group-lesson": {
    label: "グループレッスン",
    icon: Users,
    colorClass: "text-blue-600",
    iconBg: "bg-blue-50",
  },
  "master-course": {
    label: "マスターコース",
    icon: BookOpen,
    colorClass: "text-purple-600",
    iconBg: "bg-purple-50",
  },
  "trial-lesson": {
    label: "体験レッスン",
    icon: Sparkles,
    colorClass: "text-green-600",
    iconBg: "bg-green-50",
  },
};

const statusLabels: Record<ServiceStatus, string> = {
  published: "公開中",
  draft: "下書き",
  archived: "アーカイブ",
};

function formatPrice(price: number) {
  return `¥${price.toLocaleString()}`;
}

interface ServicesClientProps {
  initialServices: Service[];
  recipes: Recipe[];
}

export function ServicesClient({ initialServices, recipes }: ServicesClientProps) {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);

  const filtered = services.filter((s) => {
    if (search && !s.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (typeFilter !== "all" && s.type !== typeFilter) return false;
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    return true;
  });

  function getLinkedRecipeName(service: Service): string | null {
    if (!service.linkedRecipeId) return null;
    const recipe = recipes.find((r) => r.id === service.linkedRecipeId);
    return recipe ? recipe.name : null;
  }

  async function handleDuplicate(service: Service) {
    const { id, createdAt, updatedAt, ...rest } = service;
    const newData = { ...rest, title: `${rest.title}（コピー）`, status: "draft" as const };

    // Optimistic update
    const optimisticService: Service = {
      ...newData,
      id: `temp-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setServices((prev) => [optimisticService, ...prev]);

    await addService(newData);
  }

  async function handleDelete() {
    if (deleteTarget) {
      const targetId = deleteTarget.id;
      // Optimistic update
      setServices((prev) => prev.filter((s) => s.id !== targetId));
      setDeleteTarget(null);

      await deleteService(targetId);
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">レッスン一覧</h1>
        <Link
          href="/dashboard/services/new"
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus size={16} />
          新規レッスンを作成
        </Link>
      </div>

      {/* Search, Filter, View Toggle */}
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="レッスン名で検索..."
        filters={
          <>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-border rounded-lg px-3 py-2.5 text-sm text-text-secondary focus:border-primary focus:outline-none"
            >
              <option value="all">すべてのタイプ</option>
              <option value="group-lesson">グループレッスン</option>
              <option value="master-course">マスターコース</option>
              <option value="trial-lesson">体験レッスン</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-border rounded-lg px-3 py-2.5 text-sm text-text-secondary focus:border-primary focus:outline-none"
            >
              <option value="all">すべてのステータス</option>
              <option value="published">公開中</option>
              <option value="draft">下書き</option>
              <option value="archived">アーカイブ</option>
            </select>
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 transition-colors ${
                  viewMode === "grid"
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:bg-bg-secondary"
                }`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 transition-colors ${
                  viewMode === "list"
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:bg-bg-secondary"
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </>
        }
      />

      {/* Results count */}
      <p className="text-sm text-text-tertiary mb-4">
        {filtered.length}件のレッスン
      </p>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((service) => {
            const tc = typeConfig[service.type];
            const TypeIcon = tc.icon;
            const recipeName = getLinkedRecipeName(service);
            return (
              <div
                key={service.id}
                className="bg-white rounded-xl border border-border-light p-6 flex flex-col"
              >
                {/* Type icon + badges */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-10 h-10 rounded-lg ${tc.iconBg} ${tc.colorClass} flex items-center justify-center`}
                  >
                    <TypeIcon size={20} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge status={service.type} />
                    <Badge status={service.status} />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-text-primary mb-1">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                  {service.description}
                </p>

                {/* Linked Recipe */}
                {recipeName && (
                  <div className="flex items-center gap-1.5 text-xs text-accent mb-3">
                    <UtensilsCrossed size={12} />
                    <span>レシピ: {recipeName}</span>
                  </div>
                )}

                {/* Meta info */}
                <div className="flex flex-wrap gap-3 text-xs text-text-tertiary mb-4">
                  {service.duration && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {service.duration}分
                    </span>
                  )}
                  {service.capacity && (
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      定員{service.capacity}名
                    </span>
                  )}
                  {service.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {service.location}
                    </span>
                  )}
                  {service.schedules.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {service.schedules.length}件のスケジュール
                    </span>
                  )}
                </div>

                {/* Price */}
                <p className="text-lg font-bold text-text-primary mb-4">
                  {formatPrice(service.price)}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border-light">
                  <Link
                    href={`/dashboard/services/${service.id}`}
                    className="flex items-center gap-1.5 border border-border rounded-lg px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
                  >
                    <Edit3 size={14} />
                    編集
                  </Link>
                  <button
                    onClick={() => handleDuplicate(service)}
                    className="flex items-center gap-1.5 border border-border rounded-lg px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
                  >
                    <Copy size={14} />
                    複製
                  </button>
                  <button
                    onClick={() => setDeleteTarget(service)}
                    className="flex items-center gap-1.5 border border-border rounded-lg px-4 py-2.5 text-sm text-error hover:bg-error/5 transition-colors ml-auto"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="bg-white rounded-xl border border-border-light overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-light">
                <th className="text-left px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  レッスン
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  タイプ
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  レシピ
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  ステータス
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  価格
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((service) => {
                const tc = typeConfig[service.type];
                const TypeIcon = tc.icon;
                const recipeName = getLinkedRecipeName(service);
                return (
                  <tr
                    key={service.id}
                    className="border-b border-border-light last:border-0 hover:bg-bg-secondary/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg ${tc.iconBg} ${tc.colorClass} flex items-center justify-center shrink-0`}
                        >
                          <TypeIcon size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {service.title}
                          </p>
                          <p className="text-xs text-text-tertiary">
                            {service.category}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={service.type} />
                    </td>
                    <td className="px-6 py-4">
                      {recipeName ? (
                        <span className="flex items-center gap-1 text-xs text-accent">
                          <UtensilsCrossed size={12} />
                          {recipeName}
                        </span>
                      ) : (
                        <span className="text-xs text-text-tertiary">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={service.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-medium text-text-primary">
                        {formatPrice(service.price)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/services/${service.id}`}
                          className="p-2 rounded-lg text-text-secondary hover:bg-bg-secondary transition-colors"
                          title="編集"
                        >
                          <Edit3 size={15} />
                        </Link>
                        <button
                          onClick={() => handleDuplicate(service)}
                          className="p-2 rounded-lg text-text-secondary hover:bg-bg-secondary transition-colors"
                          title="複製"
                        >
                          <Copy size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(service)}
                          className="p-2 rounded-lg text-error hover:bg-error/5 transition-colors"
                          title="削除"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-border-light">
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
            <Users size={48} className="text-border mb-4" />
            <h2 className="text-lg font-bold text-text-primary mb-2">
              該当するレッスンがありません
            </h2>
            <p className="text-sm text-text-secondary mb-6 max-w-md leading-relaxed">
              検索条件を変更するか、新しいレッスンを作成してください。
            </p>
            <Link
              href="/dashboard/services/new"
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              <Plus size={16} />
              新規レッスンを作成
            </Link>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="レッスンを削除"
        size="sm"
      >
        <div>
          <p className="text-sm text-text-secondary mb-2">
            以下のレッスンを削除してもよろしいですか？
          </p>
          <p className="text-sm font-medium text-text-primary mb-1">
            {deleteTarget?.title}
          </p>
          <p className="text-xs text-text-tertiary mb-6">
            この操作は取り消せません。関連する予約データにも影響する場合があります。
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              className="border border-border rounded-lg px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleDelete}
              className="bg-error text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-error/90 transition-colors"
            >
              削除する
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

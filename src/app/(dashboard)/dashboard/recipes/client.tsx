"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  ChefHat,
  Edit3,
  Trash2,
  UtensilsCrossed,
  LinkIcon,
} from "lucide-react";
import { SearchFilterBar } from "@/components/ui/search-filter-bar";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { deleteRecipe as deleteRecipeAction } from "@/lib/actions";
import type { Recipe, Service } from "@/lib/types";

function formatCurrency(amount: number) {
  return `¥${Math.round(amount).toLocaleString()}`;
}

interface RecipesClientProps {
  initialRecipes: Recipe[];
  services: Service[];
}

export function RecipesClient({ initialRecipes, services }: RecipesClientProps) {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Recipe | null>(null);

  const filtered = recipes.filter((r) => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  function getLinkedServiceName(serviceId?: string) {
    if (!serviceId) return null;
    const service = services.find((s) => s.id === serviceId);
    return service?.title ?? null;
  }

  async function handleDelete() {
    if (deleteTarget) {
      const deletedId = deleteTarget.id;

      // Optimistic update
      setRecipes((prev) => prev.filter((r) => r.id !== deletedId));
      setDeleteTarget(null);

      await deleteRecipeAction(deletedId);
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">レシピ管理</h1>
        <Link
          href="/dashboard/recipes/new"
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus size={16} />
          新規レシピを作成
        </Link>
      </div>

      {/* Search */}
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="レシピ名で検索..."
      />

      {/* Results count */}
      <p className="text-sm text-text-tertiary mb-4">
        {filtered.length}件のレシピ
      </p>

      {/* Recipe Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((recipe) => {
            const linkedName = getLinkedServiceName(recipe.linkedServiceId);
            return (
              <div
                key={recipe.id}
                className="bg-white rounded-xl border border-border-light p-6 flex flex-col"
              >
                {/* Header row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                    <ChefHat size={20} />
                  </div>
                  <span className="text-xs text-text-tertiary">
                    材料: {recipe.ingredients.length}種類
                  </span>
                </div>

                {/* Name */}
                <h3 className="text-base font-bold text-text-primary mb-1">
                  {recipe.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                  {recipe.description}
                </p>

                {/* Meta info */}
                <div className="flex flex-wrap gap-3 text-xs text-text-tertiary mb-3">
                  <span className="flex items-center gap-1">
                    <UtensilsCrossed size={12} />
                    {recipe.servings}人分
                  </span>
                  {linkedName && (
                    <span className="flex items-center gap-1">
                      <LinkIcon size={12} />
                      {linkedName}
                    </span>
                  )}
                </div>

                {/* Cost info */}
                <div className="flex items-center gap-4 mb-4">
                  <div>
                    <span className="text-xs text-text-tertiary block">合計原価</span>
                    <span className="text-sm font-bold text-text-primary">
                      {formatCurrency(recipe.totalCost)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-text-tertiary block">1人あたり</span>
                    <span className="text-sm font-bold text-accent">
                      {formatCurrency(recipe.costPerServing)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border-light">
                  <Link
                    href={`/dashboard/recipes/${recipe.id}`}
                    className="flex items-center gap-1.5 border border-border rounded-lg px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
                  >
                    <Edit3 size={14} />
                    編集
                  </Link>
                  <button
                    onClick={() => setDeleteTarget(recipe)}
                    className="flex items-center gap-1.5 border border-border rounded-lg px-4 py-2.5 text-sm text-error hover:bg-error/5 transition-colors ml-auto"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border-light">
          <EmptyState
            icon={ChefHat}
            title="レシピがありません"
            description="新しいレシピを作成して、レッスンの原価管理を始めましょう。"
            action={
              <Link
                href="/dashboard/recipes/new"
                className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
              >
                <Plus size={16} />
                新規レシピを作成
              </Link>
            }
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="レシピを削除"
        size="sm"
      >
        <div>
          <p className="text-sm text-text-secondary mb-2">
            以下のレシピを削除してもよろしいですか？
          </p>
          <p className="text-sm font-medium text-text-primary mb-1">
            {deleteTarget?.name}
          </p>
          <p className="text-xs text-text-tertiary mb-6">
            この操作は取り消せません。紐付けられたレッスンからも解除されます。
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

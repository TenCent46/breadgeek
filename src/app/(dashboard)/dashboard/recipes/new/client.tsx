"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  ChefHat,
  Link as LinkIcon,
} from "lucide-react";
import { addRecipe as addRecipeAction } from "@/lib/actions";
import type { RecipeIngredient, Ingredient, Service } from "@/lib/types";

interface IngredientRow {
  ingredientId: string;
  ingredientName: string;
  quantityGrams: number;
}

function formatCurrency(amount: number) {
  return `\u00a5${Math.round(amount).toLocaleString()}`;
}

interface RecipeNewClientProps {
  ingredients: Ingredient[];
  services: Service[];
}

export function RecipeNewClient({ ingredients, services }: RecipeNewClientProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [servings, setServings] = useState(1);
  const [notes, setNotes] = useState("");
  const [linkedServiceId, setLinkedServiceId] = useState("");
  const [rows, setRows] = useState<IngredientRow[]>([]);

  // Compute cost per row
  function getUnitCost(ingredientId: string): number {
    const ing = ingredients.find((i) => i.id === ingredientId);
    return ing?.unitCostPerKg ?? 0;
  }

  function rowSubtotal(row: IngredientRow): number {
    return (row.quantityGrams / 1000) * getUnitCost(row.ingredientId);
  }

  const totalCost = useMemo(
    () => rows.reduce((sum, r) => sum + rowSubtotal(r), 0),
    [rows, ingredients]
  );

  const costPerServing = servings > 0 ? totalCost / servings : 0;

  function addRow() {
    setRows((prev) => [
      ...prev,
      { ingredientId: "", ingredientName: "", quantityGrams: 0 },
    ]);
  }

  function updateRow(index: number, field: keyof IngredientRow, value: string | number) {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== index) return r;
        if (field === "ingredientId") {
          const ing = ingredients.find((ig) => ig.id === value);
          return { ...r, ingredientId: value as string, ingredientName: ing?.name ?? "" };
        }
        return { ...r, [field]: value };
      })
    );
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!name.trim()) return;

    const recipeIngredients: RecipeIngredient[] = rows
      .filter((r) => r.ingredientId)
      .map((r) => ({
        ingredientId: r.ingredientId,
        ingredientName: r.ingredientName,
        quantityGrams: r.quantityGrams,
      }));

    await addRecipeAction({
      name: name.trim(),
      description,
      servings,
      ingredients: recipeIngredients,
      totalCost: Math.round(totalCost),
      costPerServing: Math.round(costPerServing),
      linkedServiceId: linkedServiceId || undefined,
      notes,
    });

    router.push("/dashboard/recipes");
  }

  // Only published services for linking
  const publishedServices = services.filter((s) => s.status === "published");

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Back link */}
      <Link
        href="/dashboard/recipes"
        className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        レシピ一覧に戻る
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
          <ChefHat size={20} />
        </div>
        <h1 className="text-2xl font-bold text-text-primary">新規レシピ作成</h1>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-border-light p-6 mb-4">
        <h2 className="text-lg font-bold text-text-primary mb-6">基本情報</h2>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              レシピ名 <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 天然酵母カンパーニュ"
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
              placeholder="レシピの概要を入力してください"
              rows={3}
              className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                分量 / 人数
              </label>
              <input
                type="number"
                value={servings}
                onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                レッスン紐付け
              </label>
              <div className="relative">
                <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <select
                  value={linkedServiceId}
                  onChange={(e) => setLinkedServiceId(e.target.value)}
                  className="w-full border border-border rounded-lg pl-10 pr-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                >
                  <option value="">なし</option>
                  {publishedServices.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              メモ
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="作り方のポイントなど"
              rows={3}
              className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div className="bg-white rounded-xl border border-border-light p-6 mb-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-text-primary">材料リスト</h2>
          <button
            onClick={addRow}
            className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-hover transition-colors font-medium"
          >
            <Plus size={14} />
            材料を追加
          </button>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ChefHat size={36} className="text-border mb-3" />
            <p className="text-sm text-text-tertiary mb-3">
              材料がまだ追加されていません
            </p>
            <button
              onClick={addRow}
              className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
            >
              <Plus size={14} />
              材料を追加
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-light">
                    <th className="text-left px-3 py-2.5 text-xs font-medium text-text-tertiary">
                      材料名
                    </th>
                    <th className="text-right px-3 py-2.5 text-xs font-medium text-text-tertiary w-28">
                      使用量(g)
                    </th>
                    <th className="text-right px-3 py-2.5 text-xs font-medium text-text-tertiary w-28">
                      単価/kg
                    </th>
                    <th className="text-right px-3 py-2.5 text-xs font-medium text-text-tertiary w-28">
                      小計
                    </th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index} className="border-b border-border-light last:border-b-0">
                      <td className="px-3 py-2.5">
                        <select
                          value={row.ingredientId}
                          onChange={(e) => updateRow(index, "ingredientId", e.target.value)}
                          className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
                        >
                          <option value="">材料を選択</option>
                          {ingredients.map((ing) => (
                            <option key={ing.id} value={ing.id}>
                              {ing.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2.5">
                        <input
                          type="number"
                          value={row.quantityGrams || ""}
                          onChange={(e) =>
                            updateRow(index, "quantityGrams", Math.max(0, parseFloat(e.target.value) || 0))
                          }
                          min={0}
                          className="w-full border border-border rounded-lg px-3 py-2 text-sm text-right focus:border-primary focus:outline-none"
                        />
                      </td>
                      <td className="px-3 py-2.5 text-sm text-text-secondary text-right">
                        {row.ingredientId
                          ? formatCurrency(getUnitCost(row.ingredientId))
                          : "-"}
                      </td>
                      <td className="px-3 py-2.5 text-sm font-medium text-text-primary text-right">
                        {row.ingredientId && row.quantityGrams > 0
                          ? formatCurrency(rowSubtotal(row))
                          : "-"}
                      </td>
                      <td className="px-3 py-2.5">
                        <button
                          onClick={() => removeRow(index)}
                          className="p-1.5 text-error hover:bg-error/5 rounded transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-4 pt-4 border-t border-border-light flex items-center justify-end gap-6">
              <div className="text-right">
                <span className="text-xs text-text-tertiary block">合計原価</span>
                <span className="text-lg font-bold text-text-primary">
                  {formatCurrency(totalCost)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-text-tertiary block">1人あたり</span>
                <span className="text-lg font-bold text-accent">
                  {formatCurrency(costPerServing)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-8">
        <Link
          href="/dashboard/recipes"
          className="flex items-center gap-2 border border-border rounded-lg px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
        >
          キャンセル
        </Link>
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Save size={16} />
          保存
        </button>
      </div>
    </div>
  );
}

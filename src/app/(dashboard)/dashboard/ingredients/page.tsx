"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Package,
  AlertTriangle,
  Search,
  Trash2,
  Save,
  TrendingUp,
} from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";
import { Badge } from "@/components/ui/badge";
import { SlideOver } from "@/components/ui/modal";
import { Modal } from "@/components/ui/modal";
import type { Ingredient } from "@/lib/types";

type IngredientCategory = Ingredient["category"];

const categories: IngredientCategory[] = [
  "粉類",
  "乳製品",
  "油脂",
  "酵母",
  "糖類",
  "副材料",
  "その他",
];

function formatCurrency(amount: number) {
  return `\u00a5${Math.round(amount).toLocaleString()}`;
}

function formatStock(grams: number): string {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(1)}kg`;
  }
  return `${grams}g`;
}

export default function IngredientsPage() {
  const {
    ingredients,
    addIngredient,
    updateIngredient,
    deleteIngredient,
  } = useDashboard();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<IngredientCategory | "all">("all");
  const [selected, setSelected] = useState<Ingredient | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState<IngredientCategory>("粉類");
  const [editStock, setEditStock] = useState(0);
  const [editUnitCost, setEditUnitCost] = useState(0);
  const [editSupplier, setEditSupplier] = useState("");
  const [editThreshold, setEditThreshold] = useState(0);

  // Add form state
  const [addName, setAddName] = useState("");
  const [addCategory, setAddCategory] = useState<IngredientCategory>("粉類");
  const [addStock, setAddStock] = useState(0);
  const [addUnitCost, setAddUnitCost] = useState(0);
  const [addSupplier, setAddSupplier] = useState("");
  const [addThreshold, setAddThreshold] = useState(0);

  // Low stock count
  const lowStockCount = useMemo(
    () => ingredients.filter((i) => i.currentStockGrams < i.reorderThresholdGrams).length,
    [ingredients]
  );

  // Filtered ingredients
  const filtered = useMemo(() => {
    return ingredients.filter((i) => {
      if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== "all" && i.category !== categoryFilter) return false;
      return true;
    });
  }, [ingredients, search, categoryFilter]);

  function openDetail(ing: Ingredient) {
    setSelected(ing);
    setEditName(ing.name);
    setEditCategory(ing.category);
    setEditStock(ing.currentStockGrams);
    setEditUnitCost(ing.unitCostPerKg);
    setEditSupplier(ing.supplier);
    setEditThreshold(ing.reorderThresholdGrams);
  }

  function handleSaveEdit() {
    if (!selected) return;
    updateIngredient(selected.id, {
      name: editName.trim(),
      category: editCategory,
      currentStockGrams: editStock,
      unitCostPerKg: editUnitCost,
      supplier: editSupplier.trim(),
      reorderThresholdGrams: editThreshold,
    });
    setSelected(null);
  }

  function handleDeleteIngredient() {
    if (!selected) return;
    deleteIngredient(selected.id);
    setSelected(null);
  }

  function openAddModal() {
    setAddName("");
    setAddCategory("粉類");
    setAddStock(0);
    setAddUnitCost(0);
    setAddSupplier("");
    setAddThreshold(0);
    setShowAdd(true);
  }

  function handleAdd() {
    if (!addName.trim()) return;
    addIngredient({
      name: addName.trim(),
      category: addCategory,
      currentStockGrams: addStock,
      unitCostPerKg: addUnitCost,
      supplier: addSupplier.trim(),
      reorderThresholdGrams: addThreshold,
    });
    setShowAdd(false);
  }

  function isLowStock(ing: Ingredient): boolean {
    return ing.currentStockGrams < ing.reorderThresholdGrams;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">材料・在庫</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus size={16} />
          材料を追加
        </button>
      </div>

      {/* Low stock warning banner */}
      {lowStockCount > 0 && (
        <div className="flex items-center gap-3 bg-warning/10 border border-warning/30 rounded-xl px-5 py-4 mb-6">
          <AlertTriangle size={20} className="text-warning shrink-0" />
          <p className="text-sm text-text-primary">
            <span className="font-medium">在庫不足:</span> {lowStockCount}件の材料が発注ポイントを下回っています
          </p>
        </div>
      )}

      {/* Search + Category Filter */}
      <div className="bg-white rounded-xl border border-border-light p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="材料名で検索..."
              className="w-full border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as IngredientCategory | "all")}
            className="border border-border rounded-lg px-3 py-2.5 text-sm text-text-secondary focus:border-primary focus:outline-none"
          >
            <option value="all">すべてのカテゴリ</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-text-tertiary mb-4">
        {filtered.length}件の材料
      </p>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border-light overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-light bg-bg-secondary/30">
                <th className="text-left px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  材料名
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  カテゴリ
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  在庫
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  単価 (¥/kg)
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  仕入先
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  発注ポイント
                </th>
                <th className="text-center px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  ステータス
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <Package size={40} className="text-border mb-3" />
                      <p className="text-sm text-text-tertiary">
                        該当する材料が見つかりません
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((ing) => {
                  const low = isLowStock(ing);
                  return (
                    <tr
                      key={ing.id}
                      onClick={() => openDetail(ing)}
                      className={`border-b border-border-light last:border-b-0 cursor-pointer transition-colors ${
                        low
                          ? "bg-warning/5 hover:bg-warning/10"
                          : "hover:bg-bg-secondary/30"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                            <Package size={16} />
                          </div>
                          <span className="text-sm font-medium text-text-primary">
                            {ing.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {ing.category}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-text-primary text-right">
                        {formatStock(ing.currentStockGrams)}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-primary text-right">
                        {formatCurrency(ing.unitCostPerKg)}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {ing.supplier}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary text-right">
                        {formatStock(ing.reorderThresholdGrams)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {low ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-error/10 text-error">
                            在庫不足
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success/10 text-success">
                            適正
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SlideOver Edit */}
      <SlideOver
        open={!!selected}
        onClose={() => setSelected(null)}
        title="材料を編集"
      >
        {selected && (
          <div className="space-y-6">
            {/* Edit form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  材料名 <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  カテゴリ
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as IngredientCategory)}
                  className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    現在の在庫 (g)
                  </label>
                  <input
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(Math.max(0, parseFloat(e.target.value) || 0))}
                    min={0}
                    className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    単価 (¥/kg)
                  </label>
                  <input
                    type="number"
                    value={editUnitCost}
                    onChange={(e) => setEditUnitCost(Math.max(0, parseFloat(e.target.value) || 0))}
                    min={0}
                    className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  仕入先
                </label>
                <input
                  type="text"
                  value={editSupplier}
                  onChange={(e) => setEditSupplier(e.target.value)}
                  className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  発注ポイント (g)
                </label>
                <input
                  type="number"
                  value={editThreshold}
                  onChange={(e) => setEditThreshold(Math.max(0, parseFloat(e.target.value) || 0))}
                  min={0}
                  className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>

            {/* Cost History */}
            {selected.costHistory.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                  <TrendingUp size={14} />
                  単価履歴
                </h4>
                <div className="border border-border-light rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border-light bg-bg-secondary/30">
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-text-tertiary">
                          日付
                        </th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-text-tertiary">
                          単価 (¥/kg)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.costHistory.map((ch, i) => (
                        <tr
                          key={i}
                          className="border-b border-border-light last:border-b-0"
                        >
                          <td className="px-4 py-2.5 text-sm text-text-secondary">
                            {ch.date}
                          </td>
                          <td className="px-4 py-2.5 text-sm text-text-primary text-right font-medium">
                            {formatCurrency(ch.unitCostPerKg)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border-light">
              <button
                onClick={handleDeleteIngredient}
                className="flex items-center gap-2 border border-error text-error rounded-lg px-4 py-2.5 text-sm hover:bg-error/5 transition-colors"
              >
                <Trash2 size={14} />
                削除
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editName.trim()}
                className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                保存
              </button>
            </div>
          </div>
        )}
      </SlideOver>

      {/* Add Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="材料を追加" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              材料名 <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              placeholder="例: 強力粉"
              className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              カテゴリ
            </label>
            <select
              value={addCategory}
              onChange={(e) => setAddCategory(e.target.value as IngredientCategory)}
              className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                現在の在庫 (g)
              </label>
              <input
                type="number"
                value={addStock}
                onChange={(e) => setAddStock(Math.max(0, parseFloat(e.target.value) || 0))}
                min={0}
                className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                単価 (¥/kg)
              </label>
              <input
                type="number"
                value={addUnitCost}
                onChange={(e) => setAddUnitCost(Math.max(0, parseFloat(e.target.value) || 0))}
                min={0}
                className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              仕入先
            </label>
            <input
              type="text"
              value={addSupplier}
              onChange={(e) => setAddSupplier(e.target.value)}
              placeholder="例: 富澤商店"
              className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              発注ポイント (g)
            </label>
            <input
              type="number"
              value={addThreshold}
              onChange={(e) => setAddThreshold(Math.max(0, parseFloat(e.target.value) || 0))}
              min={0}
              className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              onClick={() => setShowAdd(false)}
              className="border border-border rounded-lg px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleAdd}
              disabled={!addName.trim()}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
              追加する
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

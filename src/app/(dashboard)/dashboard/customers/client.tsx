"use client";

import { useState } from "react";
import { Users, Download, X, Plus, Save, CalendarPlus } from "lucide-react";
import { updateCustomer } from "@/lib/actions";
import { Badge } from "@/components/ui/badge";
import { SearchFilterBar } from "@/components/ui/search-filter-bar";
import { SlideOver } from "@/components/ui/modal";
import type { Customer, CustomerTier } from "@/lib/types";

const tierFilters: { value: CustomerTier | "all"; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "repeater", label: "リピーター" },
  { value: "regular", label: "レギュラー" },
  { value: "trial", label: "体験生" },
  { value: "dormant", label: "休眠" },
];

const skillLevelLabels: Record<string, { label: string; color: string }> = {
  beginner: { label: "初級", color: "bg-green-100 text-green-700" },
  intermediate: { label: "中級", color: "bg-blue-100 text-blue-700" },
  advanced: { label: "上級", color: "bg-purple-100 text-purple-700" },
};

function tierCount(customers: Customer[], tier: CustomerTier | "all") {
  if (tier === "all") return customers.length;
  return customers.filter((c) => c.tier === tier).length;
}

function formatYen(n: number) {
  return `¥${n.toLocaleString()}`;
}

function avatarColor(name: string) {
  const colors = [
    "bg-primary/10 text-primary",
    "bg-accent/10 text-accent",
    "bg-info/10 text-info",
    "bg-success/10 text-success",
    "bg-warning/10 text-warning",
    "bg-purple-100 text-purple-600",
    "bg-pink-100 text-pink-600",
    "bg-orange-100 text-orange-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

interface CustomersClientProps {
  initialCustomers: Customer[];
}

export function CustomersClient({ initialCustomers }: CustomersClientProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<CustomerTier | "all">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Customer | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  const filtered = customers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchTier = tierFilter === "all" || c.tier === tierFilter;
    return matchSearch && matchTier;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((c) => c.id)));
    }
  };

  const openDetail = (c: Customer) => {
    setSelected(c);
    setEditNotes(c.notes);
    setEditTags([...c.tags]);
    setNewTag("");
  };

  const closeDetail = () => setSelected(null);

  const handleSave = () => {
    if (!selected) return;
    // Optimistic local state update
    const updatedCustomer = { ...selected, notes: editNotes, tags: editTags };
    setSelected(updatedCustomer);
    setCustomers((prev) =>
      prev.map((c) => (c.id === selected.id ? { ...c, notes: editNotes, tags: editTags } : c))
    );
    // Fire server action
    updateCustomer(selected.id, { notes: editNotes, tags: editTags });
  };

  const addTag = () => {
    const tag = newTag.trim();
    if (tag && !editTags.includes(tag)) {
      setEditTags([...editTags, tag]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setEditTags(editTags.filter((t) => t !== tag));
  };

  const avgSpent = selected && selected.visitCount > 0
    ? Math.round(selected.totalSpent / selected.visitCount)
    : 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">生徒一覧</h1>
        <button
          onClick={() => alert("CSVエクスポート機能は現在開発中です。")}
          className="flex items-center gap-2 border border-border rounded-lg px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
        >
          <Download size={16} />
          CSVエクスポート
        </button>
      </div>

      {/* Tier Filter Chips */}
      <div className="flex items-center gap-2 mb-4">
        {tierFilters.map((tf) => (
          <button
            key={tf.value}
            onClick={() => setTierFilter(tf.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tierFilter === tf.value
                ? "bg-primary text-white"
                : "bg-white border border-border text-text-secondary hover:bg-bg-secondary"
            }`}
          >
            {tf.label}
            <span className={`ml-1.5 text-xs ${tierFilter === tf.value ? "text-white/80" : "text-text-tertiary"}`}>
              ({tierCount(customers, tf.value)})
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="名前、メールアドレスで検索..."
      />

      {/* Table */}
      <div className="bg-white rounded-xl border border-border-light overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-light bg-bg-secondary/30">
              <th className="px-6 py-3.5 w-10">
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && selectedIds.size === filtered.length}
                  onChange={toggleAll}
                  className="rounded border-border"
                />
              </th>
              <th className="text-left px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">名前</th>
              <th className="text-left px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">ティア</th>
              <th className="text-center px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">リピート率</th>
              <th className="text-center px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">スキルレベル</th>
              <th className="text-left px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">最終利用日</th>
              <th className="text-right px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">累計購入金額</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Users size={40} className="text-border mb-3" />
                    <p className="text-sm text-text-tertiary">該当する生徒が見つかりません</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((c) => {
                const skill = skillLevelLabels[c.skillLevel];
                return (
                  <tr
                    key={c.id}
                    onClick={() => openDetail(c)}
                    className="border-b border-border-light last:border-b-0 hover:bg-bg-secondary/30 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(c.id)}
                        onChange={() => toggleSelect(c.id)}
                        className="rounded border-border"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${avatarColor(c.name)}`}>
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-text-primary">{c.name}</span>
                          <p className="text-xs text-text-tertiary">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={c.tier} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-sm font-medium ${
                        c.repeatRate >= 70 ? "text-success" : c.repeatRate >= 40 ? "text-warning" : "text-text-tertiary"
                      }`}>
                        {c.repeatRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${skill.color}`}>
                        {skill.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{c.lastVisit}</td>
                    <td className="px-6 py-4 text-sm font-medium text-text-primary text-right">
                      {formatYen(c.totalSpent)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Customer count */}
      <div className="mt-3 text-xs text-text-tertiary">
        {filtered.length}件の生徒を表示中（全{customers.length}件）
      </div>

      {/* SlideOver Detail */}
      <SlideOver open={!!selected} onClose={closeDetail} title="生徒詳細">
        {selected && (
          <div className="space-y-6">
            {/* Profile header */}
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold ${avatarColor(selected.name)}`}>
                {selected.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">{selected.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge status={selected.tier} />
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${skillLevelLabels[selected.skillLevel].color}`}>
                    {skillLevelLabels[selected.skillLevel].label}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-bg-secondary rounded-lg p-3 text-center">
                <p className="text-xs text-text-tertiary mb-1">累計購入</p>
                <p className="text-sm font-bold text-text-primary">{formatYen(selected.totalSpent)}</p>
              </div>
              <div className="bg-bg-secondary rounded-lg p-3 text-center">
                <p className="text-xs text-text-tertiary mb-1">来店回数</p>
                <p className="text-sm font-bold text-text-primary">{selected.visitCount}回</p>
              </div>
              <div className="bg-bg-secondary rounded-lg p-3 text-center">
                <p className="text-xs text-text-tertiary mb-1">平均単価</p>
                <p className="text-sm font-bold text-text-primary">{formatYen(avgSpent)}</p>
              </div>
              <div className="bg-accent/10 rounded-lg p-3 text-center">
                <p className="text-xs text-text-tertiary mb-1">リピート率</p>
                <p className={`text-sm font-bold ${
                  selected.repeatRate >= 70 ? "text-success" : selected.repeatRate >= 40 ? "text-warning" : "text-text-tertiary"
                }`}>
                  {selected.repeatRate}%
                </p>
              </div>
            </div>

            {/* Favorite class types */}
            {selected.favoriteClassTypes.length > 0 && (
              <div>
                <label className="text-xs text-text-tertiary mb-2 block">好きなレッスンタイプ</label>
                <div className="flex flex-wrap gap-2">
                  {selected.favoriteClassTypes.map((ct) => (
                    <span
                      key={ct}
                      className="inline-flex items-center bg-accent/10 text-accent text-xs font-medium px-2.5 py-1 rounded-full"
                    >
                      {ct}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact info */}
            <div className="space-y-3">
              <div>
                <label className="text-xs text-text-tertiary">メールアドレス</label>
                <p className="text-sm text-text-primary">{selected.email}</p>
              </div>
              {selected.phone && (
                <div>
                  <label className="text-xs text-text-tertiary">電話番号</label>
                  <p className="text-sm text-text-primary">{selected.phone}</p>
                </div>
              )}
            </div>

            {/* Next booking prompt */}
            <button
              onClick={() => alert("次回予約の案内メッセージを送信しました")}
              className="w-full flex items-center justify-center gap-2 bg-accent text-white px-5 py-3 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              <CalendarPlus size={16} />
              次回予約を促す
            </button>

            {/* Tags */}
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">タグ</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {editTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full"
                  >
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-primary-hover">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  placeholder="タグを追加..."
                  className="flex-1 border border-border rounded-lg px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                />
                <button
                  onClick={addTag}
                  className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">メモ</label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={3}
                className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 resize-none"
                placeholder="メモを入力..."
              />
              <button
                onClick={handleSave}
                className="mt-2 flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
              >
                <Save size={16} />
                保存
              </button>
            </div>

            {/* Purchase history */}
            <div>
              <h4 className="text-sm font-bold text-text-primary mb-3">受講履歴</h4>
              {selected.purchases.length === 0 ? (
                <p className="text-xs text-text-tertiary">受講履歴はありません</p>
              ) : (
                <div className="border border-border-light rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border-light bg-bg-secondary/30">
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-text-tertiary">レッスン名</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-text-tertiary">金額</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-text-tertiary">日付</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-text-tertiary">状態</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.purchases.map((p) => (
                        <tr key={p.id} className="border-b border-border-light last:border-b-0">
                          <td className="px-4 py-2.5 text-sm text-text-primary">{p.serviceName}</td>
                          <td className="px-4 py-2.5 text-sm text-text-primary text-right">{formatYen(p.amount)}</td>
                          <td className="px-4 py-2.5 text-sm text-text-secondary">{p.date}</td>
                          <td className="px-4 py-2.5">
                            <Badge status={p.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}

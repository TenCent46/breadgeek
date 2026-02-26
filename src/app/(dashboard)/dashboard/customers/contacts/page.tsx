"use client";

import { useState, useMemo } from "react";
import { Users, Download, Upload, Plus, X, Trash2 } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";
import { SearchFilterBar } from "@/components/ui/search-filter-bar";
import { SlideOver, Modal } from "@/components/ui/modal";
import type { Contact } from "@/lib/types";

const sources = ["Instagram", "ウェブサイト", "LINE", "紹介"];

export default function ContactsPage() {
  const { contacts, addContact, deleteContact } = useDashboard();
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selected, setSelected] = useState<Contact | null>(null);
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  // Add form state
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addSource, setAddSource] = useState("ウェブサイト");
  const [addTags, setAddTags] = useState<string[]>([]);
  const [addTagInput, setAddTagInput] = useState("");

  // All unique tags from contacts
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    contacts.forEach((c) => c.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [contacts]);

  const filtered = contacts.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchTag = tagFilter === "all" || c.tags.includes(tagFilter);
    const matchSource = sourceFilter === "all" || c.source === sourceFilter;
    return matchSearch && matchTag && matchSource;
  });

  const openDetail = (c: Contact) => {
    setSelected(c);
    setEditTags([...c.tags]);
    setNewTag("");
  };

  const closeDetail = () => setSelected(null);

  const addEditTag = () => {
    const tag = newTag.trim();
    if (tag && !editTags.includes(tag)) {
      setEditTags([...editTags, tag]);
      setNewTag("");
    }
  };

  const removeEditTag = (tag: string) => {
    setEditTags(editTags.filter((t) => t !== tag));
  };

  const handleDelete = () => {
    if (!selected) return;
    if (confirm(`${selected.name}を削除しますか？`)) {
      deleteContact(selected.id);
      closeDetail();
    }
  };

  const openAddModal = () => {
    setAddName("");
    setAddEmail("");
    setAddSource("ウェブサイト");
    setAddTags([]);
    setAddTagInput("");
    setShowAdd(true);
  };

  const handleAddTag = () => {
    const tag = addTagInput.trim();
    if (tag && !addTags.includes(tag)) {
      setAddTags([...addTags, tag]);
      setAddTagInput("");
    }
  };

  const handleAddContact = () => {
    if (!addName.trim() || !addEmail.trim()) return;
    addContact({
      name: addName.trim(),
      email: addEmail.trim(),
      source: addSource,
      tags: addTags,
      subscribedAt: new Date().toISOString().slice(0, 10),
    });
    setShowAdd(false);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">コンタクトリスト</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            <Plus size={16} />
            コンタクトを追加
          </button>
          <button
            onClick={() => alert("CSVインポート機能は現在開発中です。")}
            className="flex items-center gap-2 border border-border rounded-lg px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
          >
            <Upload size={16} />
            CSVインポート
          </button>
          <button
            onClick={() => alert("エクスポート機能は現在開発中です。")}
            className="flex items-center gap-2 border border-border rounded-lg px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
          >
            <Download size={16} />
            エクスポート
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="名前、メールアドレスで検索..."
        filters={
          <>
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="border border-border rounded-lg px-3 py-2.5 text-sm text-text-secondary focus:border-primary focus:outline-none"
            >
              <option value="all">すべてのタグ</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="border border-border rounded-lg px-3 py-2.5 text-sm text-text-secondary focus:border-primary focus:outline-none"
            >
              <option value="all">すべての流入元</option>
              {sources.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </>
        }
      />

      {/* Table */}
      <div className="bg-white rounded-xl border border-border-light overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-light bg-bg-secondary/30">
              <th className="text-left px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">名前</th>
              <th className="text-left px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">メール</th>
              <th className="text-left px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">流入元</th>
              <th className="text-left px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">タグ</th>
              <th className="text-left px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">登録日</th>
              <th className="text-left px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">最終開封</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Users size={40} className="text-border mb-3" />
                    <p className="text-sm text-text-tertiary">該当するコンタクトが見つかりません</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => openDetail(c)}
                  className="border-b border-border-light last:border-b-0 hover:bg-bg-secondary/30 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-text-primary">{c.name}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{c.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-bg-secondary text-text-secondary">
                      {c.source}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {c.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{c.subscribedAt}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{c.lastOpened || "---"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs text-text-tertiary">
        {filtered.length}件のコンタクトを表示中（全{contacts.length}件）
      </div>

      {/* Detail SlideOver */}
      <SlideOver open={!!selected} onClose={closeDetail} title="コンタクト詳細">
        {selected && (
          <div className="space-y-6">
            <div>
              <label className="text-xs text-text-tertiary">名前</label>
              <p className="text-sm font-medium text-text-primary">{selected.name}</p>
            </div>
            <div>
              <label className="text-xs text-text-tertiary">メールアドレス</label>
              <p className="text-sm text-text-primary">{selected.email}</p>
            </div>
            <div>
              <label className="text-xs text-text-tertiary">流入元</label>
              <p className="text-sm text-text-primary">{selected.source}</p>
            </div>
            <div>
              <label className="text-xs text-text-tertiary">登録日</label>
              <p className="text-sm text-text-primary">{selected.subscribedAt}</p>
            </div>

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
                    <button onClick={() => removeEditTag(tag)} className="hover:text-primary-hover">
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
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addEditTag(); } }}
                  placeholder="タグを追加..."
                  className="flex-1 border border-border rounded-lg px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                />
                <button
                  onClick={addEditTag}
                  className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Message history placeholder */}
            <div>
              <h4 className="text-sm font-bold text-text-primary mb-3">メッセージ履歴</h4>
              <div className="bg-bg-secondary rounded-lg p-4 text-center">
                <p className="text-xs text-text-tertiary">メッセージ履歴はまだありません</p>
              </div>
            </div>

            {/* Delete */}
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 text-error text-sm hover:underline"
            >
              <Trash2 size={14} />
              このコンタクトを削除
            </button>
          </div>
        )}
      </SlideOver>

      {/* Add Contact Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="コンタクトを追加">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">名前 <span className="text-error">*</span></label>
            <input
              type="text"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              placeholder="例: 山田太郎"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">メールアドレス <span className="text-error">*</span></label>
            <input
              type="email"
              value={addEmail}
              onChange={(e) => setAddEmail(e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              placeholder="例: yamada@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">流入元</label>
            <select
              value={addSource}
              onChange={(e) => setAddSource(e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            >
              {sources.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">タグ</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {addTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full"
                >
                  {tag}
                  <button onClick={() => setAddTags(addTags.filter((t) => t !== tag))} className="hover:text-primary-hover">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={addTagInput}
                onChange={(e) => setAddTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }}
                placeholder="タグを追加..."
                className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
              <button
                onClick={handleAddTag}
                className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border-light">
            <button
              onClick={() => setShowAdd(false)}
              className="border border-border rounded-lg px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleAddContact}
              disabled={!addName.trim() || !addEmail.trim()}
              className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              追加する
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus, Send, Edit3, Trash2, Mail, MessageSquare, Clock, FileText, Zap } from "lucide-react";
import { addMessage, updateMessage, deleteMessage } from "@/lib/actions";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import type { DistributionMessage, MessageChannel, MessageStatus, MessageTemplate } from "@/lib/types";

const statusFilters: { value: MessageStatus | "all"; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "sent", label: "送信済み" },
  { value: "scheduled", label: "予約" },
  { value: "draft", label: "下書き" },
];

const targetOptions = [
  { value: "all", label: "全生徒" },
  { value: "repeater", label: "リピーター" },
  { value: "regular", label: "レギュラー" },
  { value: "trial", label: "体験生" },
  { value: "dormant", label: "休眠生徒" },
];

function channelIcon(channel: MessageChannel) {
  if (channel === "email") return <Mail size={14} />;
  return <MessageSquare size={14} />;
}

function statusIcon(status: MessageStatus) {
  if (status === "sent") return <Send size={14} />;
  if (status === "scheduled") return <Clock size={14} />;
  return <FileText size={14} />;
}

interface MessagesClientProps {
  initialMessages: DistributionMessage[];
  templates: MessageTemplate[];
}

export function MessagesClient({ initialMessages, templates }: MessagesClientProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [statusFilter, setStatusFilter] = useState<MessageStatus | "all">("all");
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formChannel, setFormChannel] = useState<MessageChannel>("email");
  const [formSubject, setFormSubject] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formTarget, setFormTarget] = useState("all");
  const [formDelivery, setFormDelivery] = useState<"now" | "scheduled">("now");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");

  const filtered = messages.filter((m) => {
    return statusFilter === "all" || m.status === statusFilter;
  });

  const resetForm = () => {
    setFormChannel("email");
    setFormSubject("");
    setFormContent("");
    setFormTarget("all");
    setFormDelivery("now");
    setFormDate("");
    setFormTime("");
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setShowCreate(true);
  };

  const openEdit = (m: DistributionMessage) => {
    setEditingId(m.id);
    setFormChannel(m.channel);
    setFormSubject(m.subject);
    setFormContent(m.content);
    setFormTarget("all");
    if (m.scheduledAt) {
      setFormDelivery("scheduled");
      setFormDate(m.scheduledAt.slice(0, 10));
      setFormTime(m.scheduledAt.length > 10 ? m.scheduledAt.slice(11, 16) : "09:00");
    } else {
      setFormDelivery("now");
      setFormDate("");
      setFormTime("");
    }
    setShowCreate(true);
  };

  const handleApplyTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setFormSubject(template.subject);
      setFormContent(template.content);
      setFormChannel(template.channel);
    }
  };

  const handleSend = async () => {
    if (!formContent.trim()) return;
    const now = new Date().toISOString().slice(0, 10);
    const status = (formDelivery === "scheduled" ? "scheduled" : "sent") as MessageStatus;

    const actionData = {
      channel: formChannel,
      subject: formSubject,
      content: formContent,
      status,
      target: formTarget as "all" | "repeater" | "trial" | "dormant" | "regular",
      scheduledAt: formDelivery === "scheduled" ? `${formDate}T${formTime}` : undefined,
    };

    if (editingId) {
      setMessages((prev) =>
        prev.map((m) => (m.id === editingId ? { ...m, subject: formSubject, content: formContent, channel: formChannel, status } : m))
      );
      setShowCreate(false);
      resetForm();
      await updateMessage(editingId, actionData);
    } else {
      const optimisticMessage: DistributionMessage = {
        id: `temp-${Date.now()}`,
        channel: formChannel,
        subject: formSubject,
        content: formContent,
        status,
        recipientCount: 0,
        sentAt: formDelivery === "now" ? now : undefined,
        scheduledAt: formDelivery === "scheduled" ? `${formDate}T${formTime}` : undefined,
        openRate: undefined,
        clickRate: undefined,
        createdAt: now,
      };
      setMessages((prev) => [optimisticMessage, ...prev]);
      setShowCreate(false);
      resetForm();
      const result = await addMessage(actionData);
      if (result?.recipientCount !== undefined) {
        setMessages((prev) =>
          prev.map((m) => m.id === optimisticMessage.id ? { ...m, recipientCount: result.recipientCount } : m)
        );
      }
    }
  };

  const handleDraft = async () => {
    if (!formContent.trim()) return;
    const now = new Date().toISOString().slice(0, 10);

    const actionData = {
      channel: formChannel,
      subject: formSubject,
      content: formContent,
      status: "draft" as MessageStatus,
      target: formTarget as "all" | "repeater" | "trial" | "dormant" | "regular",
    };

    if (editingId) {
      setMessages((prev) =>
        prev.map((m) => (m.id === editingId ? { ...m, subject: formSubject, content: formContent, channel: formChannel, status: "draft" as MessageStatus } : m))
      );
      setShowCreate(false);
      resetForm();
      await updateMessage(editingId, actionData);
    } else {
      const optimisticMessage: DistributionMessage = {
        id: `temp-${Date.now()}`,
        channel: formChannel,
        subject: formSubject,
        content: formContent,
        status: "draft" as MessageStatus,
        recipientCount: 0,
        openRate: undefined,
        clickRate: undefined,
        createdAt: now,
      };
      setMessages((prev) => [optimisticMessage, ...prev]);
      setShowCreate(false);
      resetForm();
      await addMessage(actionData);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("このメッセージを削除しますか？")) {
      // Optimistic delete
      setMessages((prev) => prev.filter((m) => m.id !== id));
      await deleteMessage(id);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">メッセージ</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus size={16} />
          新規メッセージ作成
        </button>
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-2 mb-6">
        {statusFilters.map((sf) => (
          <button
            key={sf.value}
            onClick={() => setStatusFilter(sf.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === sf.value
                ? "bg-primary text-white"
                : "bg-white border border-border text-text-secondary hover:bg-bg-secondary"
            }`}
          >
            {sf.label}
          </button>
        ))}
      </div>

      {/* Message cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-border-light p-12 text-center">
            <Mail size={40} className="mx-auto text-border mb-3" />
            <p className="text-sm text-text-tertiary">該当するメッセージがありません</p>
          </div>
        ) : (
          filtered.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-xl border border-border-light p-6 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-base font-bold text-text-primary">{m.subject || "（件名なし）"}</h3>
                    <Badge status={m.channel} />
                    <Badge status={m.status} />
                  </div>
                  <p className="text-sm text-text-secondary line-clamp-2 mb-4">{m.content}</p>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1.5 text-text-tertiary">
                      {channelIcon(m.channel)}
                      <span>配信数: <span className="font-medium text-text-primary">{m.recipientCount}</span></span>
                    </div>
                    {m.openRate != null && (
                      <div className="text-text-tertiary">
                        開封率: <span className="font-medium text-text-primary">{m.openRate}%</span>
                      </div>
                    )}
                    {m.clickRate != null && (
                      <div className="text-text-tertiary">
                        クリック率: <span className="font-medium text-text-primary">{m.clickRate}%</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-text-tertiary">
                      {statusIcon(m.status)}
                      <span>
                        {m.status === "sent" && m.sentAt && `送信日: ${m.sentAt}`}
                        {m.status === "scheduled" && m.scheduledAt && `予定日: ${m.scheduledAt.slice(0, 10)}`}
                        {m.status === "draft" && `作成日: ${m.createdAt}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => openEdit(m)}
                    className="p-2 rounded-lg text-text-tertiary hover:bg-bg-secondary hover:text-text-primary transition-colors"
                    title="編集"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="p-2 rounded-lg text-text-tertiary hover:bg-error/10 hover:text-error transition-colors"
                    title="削除"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={showCreate}
        onClose={() => { setShowCreate(false); resetForm(); }}
        title={editingId ? "メッセージを編集" : "新規メッセージ作成"}
        size="xl"
      >
        <div className="space-y-5">
          {/* Template buttons */}
          {!editingId && templates.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">テンプレートから作成</label>
              <div className="flex flex-wrap gap-2">
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => handleApplyTemplate(tpl.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                  >
                    <Zap size={12} />
                    {tpl.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Channel toggle */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">チャネル</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFormChannel("email")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  formChannel === "email"
                    ? "bg-primary text-white"
                    : "bg-white border border-border text-text-secondary hover:bg-bg-secondary"
                }`}
              >
                <Mail size={16} />
                Email
              </button>
              <button
                onClick={() => setFormChannel("line")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  formChannel === "line"
                    ? "bg-green-600 text-white"
                    : "bg-white border border-border text-text-secondary hover:bg-bg-secondary"
                }`}
              >
                <MessageSquare size={16} />
                LINE
              </button>
            </div>
          </div>

          {/* Subject (email only) */}
          {formChannel === "email" && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">件名</label>
              <input
                type="text"
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
                className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                placeholder="メッセージの件名を入力..."
              />
            </div>
          )}

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">本文</label>
            <textarea
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              rows={8}
              className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 resize-none"
              placeholder={"メッセージ本文を入力...\n\n{{name}} で生徒名を挿入できます"}
            />
          </div>

          {/* Target */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">配信対象</label>
            <select
              value={formTarget}
              onChange={(e) => setFormTarget(e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            >
              {targetOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Delivery method */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">配信方法</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="delivery"
                  value="now"
                  checked={formDelivery === "now"}
                  onChange={() => setFormDelivery("now")}
                  className="text-primary"
                />
                <span className="text-sm text-text-primary">今すぐ送信</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="delivery"
                  value="scheduled"
                  checked={formDelivery === "scheduled"}
                  onChange={() => setFormDelivery("scheduled")}
                  className="text-primary"
                />
                <span className="text-sm text-text-primary">予約配信</span>
              </label>
            </div>
            {formDelivery === "scheduled" && (
              <div className="flex gap-3 mt-3">
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                />
                <input
                  type="time"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  className="border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border-light">
            <button
              onClick={() => { setShowCreate(false); resetForm(); }}
              className="border border-border rounded-lg px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleDraft}
              disabled={!formContent.trim()}
              className="border border-border rounded-lg px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下書き保存
            </button>
            <button
              onClick={handleSend}
              disabled={!formContent.trim()}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
              {formDelivery === "now" ? "送信する" : "予約する"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

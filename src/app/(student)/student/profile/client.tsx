"use client";

import { useState } from "react";
import { User } from "lucide-react";

interface ProfileUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export function ProfileClient({ user }: { user: ProfileUser }) {
  const [name, setName] = useState(user.name || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        setMessage("保存しました");
      } else {
        setMessage("保存に失敗しました");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">プロフィール</h1>

      <div className="bg-white rounded-xl border border-border-light p-6 max-w-lg space-y-5">
        <div className="flex items-center gap-4 pb-4 border-b border-border-light">
          {user.image ? (
            <img src={user.image} alt="" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center">
              <User size={28} />
            </div>
          )}
          <div>
            <p className="font-semibold text-text-primary">{user.name || "ゲスト"}</p>
            <p className="text-sm text-text-secondary">{user.email}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">表示名</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-border-light rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">メールアドレス</label>
          <input
            type="email"
            value={user.email}
            readOnly
            className="w-full border border-border-light rounded-lg px-4 py-3 text-sm bg-bg-secondary cursor-not-allowed"
          />
        </div>

        {message && (
          <p className={`text-sm ${message.includes("失敗") ? "text-error" : "text-green-600"}`}>
            {message}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-accent text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存する"}
        </button>
      </div>
    </div>
  );
}

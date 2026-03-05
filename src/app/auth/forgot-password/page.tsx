"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("メールアドレスを入力してください");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "エラーが発生しました");
        setIsLoading(false);
        return;
      }

      router.push(`/auth/check-email?email=${encodeURIComponent(email)}&type=reset`);
    } catch {
      setError("エラーが発生しました");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-secondary flex flex-col items-center justify-center px-4">
      <div className="mb-8">
        <Logo />
      </div>

      <div className="w-full max-w-[480px] bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-text-primary text-center mb-2">
          パスワードをリセット
        </h1>
        <p className="text-sm text-text-secondary text-center mb-8">
          登録済みのメールアドレスを入力してください
        </p>

        {error && (
          <div className="mb-5 p-3 bg-error/10 border border-error/20 rounded-lg text-sm text-error text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              メールアドレス
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-border rounded-lg pl-10 pr-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/10 transition-colors"
                placeholder="mail@example.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white py-3.5 rounded-lg text-base font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {isLoading ? "送信中..." : "リセットメールを送信"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={16} />
            ログインに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}

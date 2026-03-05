"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { Eye, EyeOff } from "lucide-react";
import { Suspense } from "react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password || password.length < 8) {
      setError("パスワードは8文字以上で入力してください");
      return;
    }
    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "エラーが発生しました");
        setIsLoading(false);
        return;
      }

      router.push("/login?reset=success");
    } catch {
      setError("エラーが発生しました");
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-bg-secondary flex flex-col items-center justify-center px-4">
        <div className="mb-8"><Logo /></div>
        <div className="w-full max-w-[480px] bg-white rounded-xl shadow-sm p-8 text-center">
          <h1 className="text-xl font-bold text-text-primary mb-2">無効なリンク</h1>
          <p className="text-sm text-text-secondary">このリンクは無効です。もう一度パスワードリセットを申請してください。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-secondary flex flex-col items-center justify-center px-4">
      <div className="mb-8">
        <Logo />
      </div>

      <div className="w-full max-w-[480px] bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-text-primary text-center mb-2">
          新しいパスワードを設定
        </h1>
        <p className="text-sm text-text-secondary text-center mb-8">
          8文字以上の新しいパスワードを入力してください
        </p>

        {error && (
          <div className="mb-5 p-3 bg-error/10 border border-error/20 rounded-lg text-sm text-error text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              新しいパスワード
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-border rounded-lg px-4 py-3.5 pr-12 text-base focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/10 transition-colors"
                placeholder="8文字以上"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              パスワード確認
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/10 transition-colors"
              placeholder="もう一度入力"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white py-3.5 rounded-lg text-base font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {isLoading ? "設定中..." : "パスワードを設定する"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { Eye, EyeOff, Mail } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = "メールアドレスを入力してください";
    }
    if (!password) {
      newErrors.password = "パスワードを入力してください";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-bg-secondary flex flex-col items-center justify-center px-4">
      <div className="mb-8">
        <Logo />
      </div>

      <div className="w-full max-w-[480px] bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-text-primary text-center mb-2">
          ログイン
        </h1>
        <p className="text-sm text-text-secondary text-center mb-8">
          アカウントにログインしてください
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
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
                className={`w-full border rounded-lg pl-10 pr-4 py-3.5 text-base focus:outline-none focus:ring-2 transition-colors ${
                  errors.email
                    ? "border-error focus:border-error focus:ring-error/10"
                    : "border-border focus:border-primary focus:ring-primary/10"
                }`}
                placeholder="mail@example.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-sm text-error">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-text-primary">
                パスワード
              </label>
              <a href="#" className="text-xs text-accent hover:underline">
                パスワードを忘れた方
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full border rounded-lg px-4 py-3.5 pr-12 text-base focus:outline-none focus:ring-2 transition-colors ${
                  errors.password
                    ? "border-error focus:border-error focus:ring-error/10"
                    : "border-border focus:border-primary focus:ring-primary/10"
                }`}
                placeholder="パスワードを入力"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-sm text-error">{errors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white py-3.5 rounded-lg text-base font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {isLoading ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm text-text-tertiary">または</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Social Login */}
        <div className="space-y-3">
          <button className="w-full flex items-center justify-center gap-3 bg-[#06C755] text-white py-3.5 rounded-lg text-base font-medium hover:opacity-90 transition-opacity">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M12 2C6.48 2 2 5.83 2 10.5c0 3.21 2.61 6.01 6.49 7.16-.09.8-.33 2.89-.38 3.34 0 0-.08.62.34.34s4.51-2.65 5.21-3.1c.67.09 1.32.14 1.97.14 5.52 0 10-3.37 10-7.88S17.52 2 12 2z"/>
            </svg>
            LINEでログイン
          </button>
          <button className="w-full flex items-center justify-center gap-3 bg-[#1877F2] text-white py-3.5 rounded-lg text-base font-medium hover:opacity-90 transition-opacity">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebookでログイン
          </button>
        </div>

        {/* Register Link */}
        <p className="mt-6 text-center text-sm text-text-secondary">
          アカウントをお持ちでない方{" "}
          <Link href="/register" className="text-primary font-medium hover:underline">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  );
}

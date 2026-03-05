"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("無効なリンクです");
      return;
    }

    fetch(`/api/auth/verify?token=${token}`)
      .then(async (res) => {
        if (res.ok) {
          setStatus("success");
        } else {
          const data = await res.json();
          setStatus("error");
          setErrorMessage(data.error || "認証に失敗しました");
        }
      })
      .catch(() => {
        setStatus("error");
        setErrorMessage("エラーが発生しました");
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-bg-secondary flex flex-col items-center justify-center px-4">
      <div className="mb-8">
        <Logo />
      </div>

      <div className="w-full max-w-[480px] bg-white rounded-xl shadow-sm p-8 text-center">
        {status === "loading" && (
          <>
            <Loader2 size={48} className="text-accent animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold text-text-primary mb-2">
              メールアドレスを確認中...
            </h1>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              認証完了
            </h1>
            <p className="text-sm text-text-secondary mb-6">
              メールアドレスが確認されました。ログインしてBreadGeekをご利用ください。
            </p>
            <Link
              href="/login"
              className="inline-block w-full bg-primary text-white py-3.5 rounded-lg text-base font-medium hover:bg-primary-hover transition-colors"
            >
              ログインする
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={32} className="text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              認証エラー
            </h1>
            <p className="text-sm text-text-secondary mb-6">
              {errorMessage}
            </p>
            <Link
              href="/login"
              className="text-sm text-accent hover:underline"
            >
              ログインページに戻る
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  );
}

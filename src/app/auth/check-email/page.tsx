"use client";

import { Logo } from "@/components/ui/logo";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const type = searchParams.get("type"); // "register" or "reset"

  const isReset = type === "reset";

  return (
    <div className="min-h-screen bg-bg-secondary flex flex-col items-center justify-center px-4">
      <div className="mb-8">
        <Logo />
      </div>

      <div className="w-full max-w-[480px] bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail size={32} className="text-accent" />
        </div>

        <h1 className="text-2xl font-bold text-text-primary mb-2">
          メールを確認してください
        </h1>

        <p className="text-sm text-text-secondary mb-6 leading-relaxed">
          {isReset ? (
            <>
              <span className="font-medium text-text-primary">{email}</span>
              {" "}にパスワードリセットのメールを送信しました。
              メール内のリンクをクリックして、新しいパスワードを設定してください。
            </>
          ) : (
            <>
              <span className="font-medium text-text-primary">{email}</span>
              {" "}に確認メールを送信しました。
              メール内のリンクをクリックして、アカウントを有効化してください。
            </>
          )}
        </p>

        <div className="bg-bg-secondary rounded-lg p-4 mb-6">
          <p className="text-xs text-text-tertiary">
            メールが届かない場合は、迷惑メールフォルダを確認してください。
            <br />
            リンクの有効期限は{isReset ? "1時間" : "24時間"}です。
          </p>
        </div>

        <Link
          href="/login"
          className="text-sm text-accent hover:underline"
        >
          ログインページに戻る
        </Link>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense>
      <CheckEmailContent />
    </Suspense>
  );
}

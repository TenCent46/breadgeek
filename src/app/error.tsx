"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="text-center max-w-md px-6">
        <h1 className="text-5xl font-bold text-error mb-4">500</h1>
        <h2 className="text-xl font-semibold text-text-primary mb-3">
          エラーが発生しました
        </h2>
        <p className="text-text-secondary mb-8">
          申し訳ありません。予期しないエラーが発生しました。<br />
          しばらくしてからもう一度お試しください。
        </p>
        <button
          onClick={reset}
          className="bg-accent text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
        >
          もう一度試す
        </button>
      </div>
    </div>
  );
}

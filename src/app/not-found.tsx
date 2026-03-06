import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="text-center max-w-md px-6">
        <h1 className="text-6xl font-bold text-accent mb-4">404</h1>
        <h2 className="text-xl font-semibold text-text-primary mb-3">
          ページが見つかりません
        </h2>
        <p className="text-text-secondary mb-8">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="bg-accent text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            トップに戻る
          </Link>
          <Link
            href="/lessons"
            className="border border-border-light text-text-primary px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-bg-secondary transition-colors"
          >
            レッスンを探す
          </Link>
        </div>
      </div>
    </div>
  );
}

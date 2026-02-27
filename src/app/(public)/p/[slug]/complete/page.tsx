"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { CheckCircle, CalendarDays, Users, ArrowRight } from "lucide-react";

export default function BookingCompletePage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();

  const lesson = searchParams.get("lesson") ?? "レッスン";
  const date = searchParams.get("date") ?? "";
  const count = searchParams.get("count") ?? "1";
  const total = searchParams.get("total") ?? "0";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-bg-primary">
      <div className="w-full max-w-md text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <CheckCircle className="text-success" size={64} />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          ご予約ありがとうございます！
        </h1>

        {/* Subtitle */}
        <p className="text-text-secondary mb-8">
          予約が完了しました。確認メールをお送りしました。
        </p>

        {/* Booking Summary Card */}
        <div className="bg-white border border-border-light rounded-xl p-6 mb-8 text-left">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            {lesson}
          </h2>

          <div className="space-y-3">
            {date && (
              <div className="flex items-center gap-3 text-text-secondary">
                <CalendarDays size={18} className="shrink-0" />
                <span>{date}</span>
              </div>
            )}

            <div className="flex items-center gap-3 text-text-secondary">
              <Users size={18} className="shrink-0" />
              <span>{count}名</span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-border-light">
            <p className="text-sm text-text-secondary">合計金額</p>
            <p className="text-2xl font-bold text-accent">
              ¥{Number(total).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link
            href={`/p/${slug}`}
            className="inline-flex items-center justify-center gap-2 bg-accent text-white font-medium rounded-xl px-6 py-3 hover:opacity-90 transition-opacity"
          >
            教室トップに戻る
            <ArrowRight size={16} />
          </Link>

          <Link
            href={`/p/${slug}`}
            className="inline-flex items-center justify-center gap-2 border border-accent text-accent font-medium rounded-xl px-6 py-3 hover:bg-accent/5 transition-colors"
          >
            他のレッスンを見る
          </Link>
        </div>
      </div>
    </div>
  );
}

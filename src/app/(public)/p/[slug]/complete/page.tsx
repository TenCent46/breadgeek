import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CheckCircle, CalendarDays, Users, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BookingCompletePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ bookingId?: string }>;
}) {
  const { slug } = await params;
  const { bookingId } = await searchParams;

  if (!bookingId) notFound();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: {
        include: { school: { select: { name: true, slug: true } } },
      },
      customer: { select: { name: true } },
    },
  });

  if (!booking || booking.service.school.slug !== slug) notFound();

  const d = booking.date;
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const dateStr = `${d.getMonth() + 1}月${d.getDate()}日（${weekdays[d.getDay()]}）`;
  const timeStr = `${booking.startTime}〜${booking.endTime}`;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-bg-primary">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="text-success" size={64} />
        </div>

        <h1 className="text-2xl font-bold text-text-primary mb-2">
          ご予約ありがとうございます！
        </h1>

        <p className="text-text-secondary mb-8">
          予約が完了しました。確認メールをお送りしました。
        </p>

        <div className="bg-white border border-border-light rounded-xl p-6 mb-8 text-left">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            {booking.service.title}
          </h2>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-text-secondary">
              <CalendarDays size={18} className="shrink-0" />
              <span>{dateStr} {timeStr}</span>
            </div>

            <div className="flex items-center gap-3 text-text-secondary">
              <Users size={18} className="shrink-0" />
              <span>{booking.participants}名</span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-border-light">
            <p className="text-sm text-text-secondary">合計金額</p>
            <p className="text-2xl font-bold text-accent">
              ¥{booking.amount.toLocaleString()}
            </p>
            {booking.paymentType === "on_site" && (
              <p className="text-xs text-text-tertiary mt-1">
                当日現地でお支払いください
              </p>
            )}
          </div>
        </div>

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

"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, MapPin, Users, CreditCard, Clock } from "lucide-react";

interface BookingItem {
  id: string;
  lessonTitle: string;
  schoolName: string;
  schoolSlug: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  participants: number;
  amount: number;
  status: string;
  paymentType: string;
  serviceId: string;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}（${weekdays[d.getDay()]}）`;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    CONFIRMED: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    CANCELLED: "bg-red-100 text-red-700",
    COMPLETED: "bg-blue-100 text-blue-700",
  };
  const labels: Record<string, string> = {
    CONFIRMED: "確定",
    PENDING: "決済待ち",
    CANCELLED: "キャンセル済み",
    COMPLETED: "完了",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] || "bg-gray-100 text-gray-700"}`}>
      {labels[status] || status}
    </span>
  );
}

function BookingCard({ booking, showCancel }: { booking: BookingItem; showCancel?: boolean }) {
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!confirm("予約をキャンセルしますか？")) return;
    setCancelling(true);
    try {
      const res = await fetch("/api/booking/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        alert("キャンセルに失敗しました");
      }
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border-light p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <Link
            href={`/p/${booking.schoolSlug}/${booking.serviceId}`}
            className="text-base font-semibold text-text-primary hover:text-accent transition-colors"
          >
            {booking.lessonTitle}
          </Link>
          <p className="text-sm text-text-secondary mt-0.5">{booking.schoolName}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="space-y-2 text-sm text-text-secondary">
        <div className="flex items-center gap-2">
          <CalendarDays size={15} className="text-text-tertiary shrink-0" />
          <span>{formatDate(booking.date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={15} className="text-text-tertiary shrink-0" />
          <span>{booking.startTime}〜{booking.endTime}</span>
        </div>
        {booking.location && (
          <div className="flex items-center gap-2">
            <MapPin size={15} className="text-text-tertiary shrink-0" />
            <span>{booking.location}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Users size={15} className="text-text-tertiary shrink-0" />
          <span>{booking.participants}名</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-light">
        <div className="flex items-center gap-2">
          <CreditCard size={14} className="text-text-tertiary" />
          <span className="text-xs text-text-tertiary">
            {booking.paymentType === "stripe" ? "カード決済" : "当日払い"}
          </span>
        </div>
        <span className="text-lg font-bold text-text-primary">
          ¥{booking.amount.toLocaleString()}
        </span>
      </div>

      {showCancel && booking.status !== "CANCELLED" && (
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="mt-3 w-full text-sm text-error border border-error/30 rounded-lg py-2 hover:bg-error/5 transition-colors disabled:opacity-50"
        >
          {cancelling ? "キャンセル中..." : "この予約をキャンセルする"}
        </button>
      )}
    </div>
  );
}

export function BookingsClient({
  upcoming,
  past,
}: {
  upcoming: BookingItem[];
  past: BookingItem[];
}) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">予約一覧</h1>

      <div className="flex items-center gap-1 mb-6">
        <button
          onClick={() => setTab("upcoming")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "upcoming"
              ? "bg-accent text-white"
              : "text-text-secondary hover:bg-bg-secondary"
          }`}
        >
          今後の予約 ({upcoming.length})
        </button>
        <button
          onClick={() => setTab("past")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "past"
              ? "bg-accent text-white"
              : "text-text-secondary hover:bg-bg-secondary"
          }`}
        >
          過去の予約 ({past.length})
        </button>
      </div>

      {tab === "upcoming" && (
        <div className="space-y-4">
          {upcoming.length === 0 ? (
            <div className="text-center py-16">
              <CalendarDays size={48} className="mx-auto mb-4 text-text-placeholder" />
              <p className="text-text-secondary font-medium">予約がありません</p>
              <p className="text-sm text-text-tertiary mt-1">レッスンを探して予約してみましょう！</p>
              <Link
                href="/lessons"
                className="inline-block mt-4 bg-accent text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
              >
                レッスンを探す
              </Link>
            </div>
          ) : (
            upcoming.map((b) => <BookingCard key={b.id} booking={b} showCancel />)
          )}
        </div>
      )}

      {tab === "past" && (
        <div className="space-y-4">
          {past.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-text-tertiary">過去の予約はありません</p>
            </div>
          ) : (
            past.map((b) => <BookingCard key={b.id} booking={b} />)
          )}
        </div>
      )}
    </div>
  );
}

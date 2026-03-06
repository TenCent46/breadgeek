"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import type { Service, Review, Recipe } from "@/lib/types";
import {
  MapPin,
  Clock,
  Users,
  Star,
  CalendarDays,
  ChefHat,
  ArrowLeft,
  Minus,
  Plus,
  CheckCircle,
  Loader2,
  CreditCard,
} from "lucide-react";

const LESSON_IMAGES = [
  "https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=800&q=80&auto=format&fit=crop",
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekday = weekdays[d.getDay()];
  return `${month}月${day}日（${weekday}）`;
}

interface LessonDetailClientProps {
  slug: string;
  service: Service;
  serviceReviews: Review[];
  linkedRecipe?: Recipe;
  ownerName: string;
  schoolName: string;
  allowGuestBooking: boolean;
  stripeEnabled: boolean;
}

export function LessonDetailClient({
  slug,
  service,
  serviceReviews,
  linkedRecipe,
  ownerName,
  schoolName,
  allowGuestBooking,
  stripeEnabled,
}: LessonDetailClientProps) {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [participants, setParticipants] = useState(1);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [paymentType, setPaymentType] = useState<"on_site" | "stripe">("on_site");

  // Guest form fields
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [showGuestForm, setShowGuestForm] = useState(false);

  const serviceImage = service.images[0] || LESSON_IMAGES[0];

  const avgRating =
    serviceReviews.length > 0
      ? serviceReviews.reduce((sum, r) => sum + r.rating, 0) /
        serviceReviews.length
      : 0;

  const availableSchedules = service.schedules.map((schedule) => {
    const remaining = schedule.spotsTotal - schedule.spotsTaken;
    return {
      id: schedule.id,
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      remaining,
      total: schedule.spotsTotal,
    };
  });

  const selectedSchedule = availableSchedules.find(
    (s) => s.id === selectedDate
  );
  const maxParticipants = selectedSchedule ? selectedSchedule.remaining : 1;

  const handleDecrement = () => {
    if (participants > 1) setParticipants(participants - 1);
  };

  const handleIncrement = () => {
    if (participants < maxParticipants) setParticipants(participants + 1);
  };

  const handleBook = async () => {
    if (!selectedSchedule) return;

    // Not logged in
    if (!session?.user) {
      if (!allowGuestBooking) {
        // Redirect to login with return URL
        const returnUrl = `/p/${slug}/${service.id}`;
        router.push(`/login?callbackUrl=${encodeURIComponent(returnUrl)}`);
        return;
      }
      // Show guest form if not already visible
      if (!showGuestForm) {
        setShowGuestForm(true);
        return;
      }
      // Validate guest fields
      if (!guestName.trim() || !guestEmail.trim()) {
        setError("お名前とメールアドレスは必須です");
        return;
      }
    }

    setBooking(true);
    setError("");

    try {
      const body: Record<string, unknown> = {
        serviceId: service.id,
        scheduleId: selectedSchedule.id,
        participants,
        paymentType: stripeEnabled ? paymentType : "on_site",
      };

      if (!session?.user) {
        body.guestName = guestName.trim();
        body.guestEmail = guestEmail.trim();
        body.guestPhone = guestPhone.trim() || undefined;
      }

      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setError("ログインが必要です。");
        } else if (res.status === 409) {
          setError("申し訳ございません。満席になりました。");
        } else {
          setError(data.error || "予約に失敗しました。もう一度お試しください。");
        }
        return;
      }

      // If Stripe pre-payment, redirect to checkout
      if (paymentType === "stripe") {
        const checkoutRes = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId: data.bookingId }),
        });
        const checkoutData = await checkoutRes.json();
        if (checkoutRes.ok && checkoutData.url) {
          window.location.href = checkoutData.url;
          return;
        }
        // If checkout creation fails, still show completion (on_site fallback)
      }

      router.push(`/p/${slug}/complete?bookingId=${data.bookingId}`);
    } catch {
      setError("通信エラーが発生しました。もう一度お試しください。");
    } finally {
      setBooking(false);
    }
  };

  const initial = ownerName.charAt(0) || "先";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column */}
        <div className="flex-1 lg:w-2/3 min-w-0 space-y-8">
          <Link
            href={`/p/${slug}`}
            className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            教室トップに戻る
          </Link>

          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge status={service.type} />
              <Badge status={service.category} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
              {service.title}
            </h1>
            {serviceReviews.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <div className="flex items-center gap-0.5 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-medium">{avgRating.toFixed(1)}</span>
                </div>
                <span>({serviceReviews.length}件のレビュー)</span>
              </div>
            )}
            <p className="text-text-secondary leading-relaxed">
              {service.description}
            </p>
          </div>

          <div className="rounded-xl overflow-hidden">
            <img
              src={serviceImage}
              alt={service.title}
              className="w-full h-64 sm:h-80 object-cover"
            />
          </div>

          <div className="bg-white rounded-xl border border-border-light p-6 space-y-4">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-accent" />
              レッスン内容
            </h2>

            {linkedRecipe && (
              <div className="bg-bg-primary rounded-lg p-4 space-y-1">
                <p className="text-sm font-medium text-accent">
                  今回のレシピ
                </p>
                <p className="font-medium text-text-primary">
                  {linkedRecipe.name}
                </p>
                <p className="text-sm text-text-secondary">
                  {linkedRecipe.description}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium text-text-primary">
                学べること
              </p>
              <ul className="space-y-2">
                {[
                  "生地の作り方と発酵のポイント",
                  "成形テクニック",
                  "焼成の温度管理",
                  "ご自宅での再現方法",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-text-secondary text-sm"
                  >
                    <CheckCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border-light p-6 space-y-3">
            <h2 className="text-lg font-bold text-text-primary">持ち物</h2>
            <ul className="space-y-2">
              {["エプロン", "ハンドタオル", "持ち帰り用袋"].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-text-secondary text-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-border-light p-6 space-y-4">
            <h2 className="text-lg font-bold text-text-primary">講師</h2>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xl font-bold shrink-0">
                {initial}
              </div>
              <div className="space-y-1">
                <p className="font-medium text-text-primary">{ownerName}</p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  パン職人歴15年。天然酵母と国産小麦にこだわったパン作りを教えています。
                </p>
              </div>
            </div>
          </div>

          {serviceReviews.length > 0 && (
            <div className="bg-white rounded-xl border border-border-light p-6 space-y-4">
              <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                レビュー
                <span className="text-sm font-normal text-text-tertiary">
                  ({serviceReviews.length}件)
                </span>
              </h2>
              <div className="space-y-4">
                {serviceReviews.slice(0, 3).map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-border-light last:border-b-0 pb-4 last:pb-0 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < review.rating
                                ? "text-yellow-500 fill-current"
                                : "text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-text-primary">
                        {review.customerName}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Sticky Sidebar) */}
        <div className="lg:w-1/3">
          <div className="lg:sticky lg:top-8 space-y-6">
            <div className="bg-white rounded-xl border border-border-light p-6 space-y-6">
              <div>
                <span className="text-3xl font-bold text-text-primary">
                  &yen;{service.price.toLocaleString()}
                </span>
                <span className="text-text-secondary text-sm">/人</span>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-text-tertiary" />
                  日程を選択
                </label>
                {availableSchedules.length > 0 ? (
                  <div className="space-y-2">
                    {availableSchedules.map((schedule) => (
                      <button
                        key={schedule.id}
                        onClick={() => {
                          setSelectedDate(schedule.id);
                          setParticipants(1);
                        }}
                        disabled={schedule.remaining <= 0}
                        className={`w-full text-left rounded-lg border p-3 transition-colors ${
                          selectedDate === schedule.id
                            ? "border-accent bg-accent/5 ring-1 ring-accent"
                            : schedule.remaining <= 0
                              ? "border-border-light bg-bg-primary text-text-tertiary cursor-not-allowed"
                              : "border-border-light hover:border-accent/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-text-primary">
                              {formatDate(schedule.date)}
                            </p>
                            <p className="text-xs text-text-tertiary">
                              {schedule.startTime}〜{schedule.endTime}
                            </p>
                          </div>
                          <span
                            className={`text-xs font-medium ${
                              schedule.remaining <= 2
                                ? "text-error"
                                : "text-text-secondary"
                            }`}
                          >
                            残り{schedule.remaining}席
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-tertiary py-2">
                    現在予約可能な日程はありません
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-text-tertiary" />
                  参加人数
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDecrement}
                    disabled={participants <= 1}
                    className="w-8 h-8 rounded-lg border border-border-light flex items-center justify-center text-text-secondary hover:border-accent hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-medium text-text-primary w-8 text-center">
                    {participants}
                  </span>
                  <button
                    onClick={handleIncrement}
                    disabled={participants >= maxParticipants}
                    className="w-8 h-8 rounded-lg border border-border-light flex items-center justify-center text-text-secondary hover:border-accent hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Guest Form */}
              {showGuestForm && !session?.user && (
                <div className="space-y-3 border-t border-border-light pt-4">
                  <p className="text-sm font-medium text-text-primary">
                    ゲスト予約情報
                  </p>
                  <input
                    type="text"
                    placeholder="お名前 *"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border-light text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <input
                    type="email"
                    placeholder="メールアドレス *"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border-light text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <input
                    type="tel"
                    placeholder="電話番号（任意）"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border-light text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              )}

              {/* Payment Type Selection */}
              {stripeEnabled && (
                <div className="space-y-2 border-t border-border-light pt-4">
                  <label className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-text-tertiary" />
                    お支払い方法
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setPaymentType("stripe")}
                      className={`w-full text-left rounded-lg border p-3 transition-colors text-sm ${
                        paymentType === "stripe"
                          ? "border-accent bg-accent/5 ring-1 ring-accent"
                          : "border-border-light hover:border-accent/50"
                      }`}
                    >
                      <span className="font-medium">カード決済（事前払い）</span>
                      <p className="text-xs text-text-tertiary mt-0.5">クレジットカードで今すぐお支払い</p>
                    </button>
                    <button
                      onClick={() => setPaymentType("on_site")}
                      className={`w-full text-left rounded-lg border p-3 transition-colors text-sm ${
                        paymentType === "on_site"
                          ? "border-accent bg-accent/5 ring-1 ring-accent"
                          : "border-border-light hover:border-accent/50"
                      }`}
                    >
                      <span className="font-medium">当日払い</span>
                      <p className="text-xs text-text-tertiary mt-0.5">レッスン当日に現地でお支払い</p>
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-border-light pt-4">
                <span className="text-sm font-medium text-text-secondary">
                  合計
                </span>
                <span className="text-xl font-bold text-text-primary">
                  &yen;{(service.price * participants).toLocaleString()}
                </span>
              </div>

              {error && (
                <p className="text-sm text-error">{error}</p>
              )}

              <button
                onClick={handleBook}
                disabled={!selectedDate || booking}
                className="w-full py-3 rounded-xl bg-accent text-white font-medium text-center transition-colors hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {booking ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    予約中...
                  </>
                ) : showGuestForm && !session?.user ? (
                  "予約を確定する"
                ) : !session?.user && !allowGuestBooking ? (
                  "ログインして予約する"
                ) : (
                  "予約する"
                )}
              </button>

              {!session?.user && authStatus !== "loading" && (
                <p className="text-xs text-text-tertiary text-center">
                  {allowGuestBooking ? (
                    <>
                      <Link href={`/login?callbackUrl=${encodeURIComponent(`/p/${slug}/${service.id}`)}`} className="text-accent hover:underline">
                        ログイン
                      </Link>
                      すると次回から入力不要
                    </>
                  ) : (
                    "予約にはログインが必要です"
                  )}
                </p>
              )}

              <div className="space-y-2 text-sm text-text-secondary">
                {service.capacity && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-text-tertiary" />
                    <span>定員 {service.capacity}名</span>
                  </div>
                )}
                {service.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-text-tertiary" />
                    <span>{service.duration}分</span>
                  </div>
                )}
                {service.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-text-tertiary" />
                    <span>{service.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

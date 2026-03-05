"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Service, Review } from "@/lib/types";
import {
  MapPin,
  Clock,
  Users,
  Star,
  CalendarDays,
  Wheat,
  ArrowRight,
  Instagram,
  ExternalLink,
} from "lucide-react";

const CATEGORIES = [
  "すべて",
  "食パン系",
  "ハード系",
  "菓子パン系",
  "天然酵母",
  "季節限定",
] as const;

const LESSON_IMAGES = [
  "https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=600&q=80&auto=format&fit=crop",
];

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={
            i <= rating
              ? "fill-accent text-accent"
              : "fill-none text-text-placeholder"
          }
        />
      ))}
    </span>
  );
}

interface SnsLinks {
  instagram: string;
  x: string;
  youtube: string;
  line: string;
  tiktok: string;
}

interface ClassroomClientProps {
  slug: string;
  schoolName: string;
  schoolDescription: string;
  schoolLocation: string;
  schoolTitle: string;
  schoolImageUrl: string | null;
  schoolThemeColor: string;
  schoolThemeType: string;
  schoolSns: SnsLinks;
  ownerName: string;
  ownerImage: string | null;
  services: Service[];
  reviews: Review[];
}

export function ClassroomClient({
  slug,
  schoolName,
  schoolDescription,
  schoolLocation,
  schoolTitle,
  schoolImageUrl,
  schoolThemeColor,
  schoolThemeType,
  schoolSns,
  ownerName,
  ownerImage,
  services,
  reviews,
}: ClassroomClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>("すべて");

  const filteredServices =
    activeCategory === "すべて"
      ? services
      : services.filter((s) => s.category === activeCategory);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const displayedReviews = reviews.slice(0, 3);

  const hasSns = Object.values(schoolSns).some((v) => v.trim() !== "");

  // Hero background: use school image or fallback
  const heroBg = schoolImageUrl
    ? schoolImageUrl
    : "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1920&q=80&auto=format&fit=crop";

  // Theme color overlay
  const heroOverlay =
    schoolThemeType === "solid" && schoolThemeColor !== "#FFFFFF"
      ? schoolThemeColor
      : undefined;

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Hero Section */}
      <section className="relative h-[420px] md:h-[480px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div
          className="absolute inset-0"
          style={
            heroOverlay
              ? { backgroundColor: heroOverlay, opacity: 0.7 }
              : { background: "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.5), rgba(0,0,0,0.3))" }
          }
        />

        <div className="relative z-10 h-full max-w-5xl mx-auto px-4 sm:px-6 flex flex-col justify-end pb-10">
          <div className="flex items-end gap-4 mb-4">
            {ownerImage ? (
              <img
                src={ownerImage}
                alt={ownerName}
                className="w-16 h-16 rounded-full object-cover border-2 border-white/50 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold border-2 border-white/50 shrink-0">
                {ownerName.charAt(0) || "?"}
              </div>
            )}
            <div>
              {schoolLocation && (
                <span className="inline-flex items-center gap-1.5 text-sm text-white/80 mb-1">
                  <MapPin size={14} />
                  {schoolLocation}
                </span>
              )}
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                {schoolName}
              </h1>
              {schoolTitle && (
                <p className="text-sm text-white/70 mt-1">{schoolTitle}</p>
              )}
            </div>
          </div>

          {schoolDescription && (
            <p className="text-base md:text-lg text-white/80 mb-4 max-w-xl">
              {schoolDescription}
            </p>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <StarRating rating={Math.round(avgRating)} />
              <span className="text-white font-semibold text-sm">
                {avgRating.toFixed(1)}
              </span>
              <span className="text-white/60 text-sm">
                ({reviews.length}件のレビュー)
              </span>
            </div>

            {/* SNS Links */}
            {hasSns && (
              <div className="flex items-center gap-2 ml-2">
                {schoolSns.instagram && (
                  <a
                    href={schoolSns.instagram.startsWith("http") ? schoolSns.instagram : `https://instagram.com/${schoolSns.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <Instagram size={16} className="text-white" />
                  </a>
                )}
                {schoolSns.x && (
                  <a
                    href={schoolSns.x.startsWith("http") ? schoolSns.x : `https://x.com/${schoolSns.x}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <span className="text-white text-sm font-bold">𝕏</span>
                  </a>
                )}
                {schoolSns.youtube && (
                  <a
                    href={schoolSns.youtube.startsWith("http") ? schoolSns.youtube : `https://youtube.com/${schoolSns.youtube}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <ExternalLink size={14} className="text-white" />
                  </a>
                )}
                {schoolSns.tiktok && (
                  <a
                    href={schoolSns.tiktok.startsWith("http") ? schoolSns.tiktok : `https://tiktok.com/@${schoolSns.tiktok}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <span className="text-white text-xs font-bold">TT</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="sticky top-0 z-20 bg-white border-b border-border-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-accent text-white"
                    : "bg-bg-secondary text-text-secondary hover:bg-bg-tertiary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lesson Cards */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">
            <Wheat size={20} className="inline-block mr-1.5 -mt-0.5 text-accent" />
            レッスン一覧
          </h2>
          <span className="text-sm text-text-tertiary">
            {filteredServices.length}件
          </span>
        </div>

        {filteredServices.length === 0 ? (
          <div className="py-20 text-center">
            <CalendarDays size={48} className="mx-auto mb-4 text-text-placeholder" />
            <p className="text-text-secondary font-medium mb-1">
              該当するレッスンがありません
            </p>
            <p className="text-text-tertiary text-sm">
              別のカテゴリーをお試しください
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredServices.map((service, idx) => {
              const nextSchedule = service.schedules[0];
              return (
                <Link
                  key={service.id}
                  href={`/p/${slug}/${service.id}`}
                  className="group bg-white rounded-xl border border-border-light overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={service.images[0] || LESSON_IMAGES[idx % LESSON_IMAGES.length]}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge status={service.type} />
                    </div>
                    {nextSchedule && (
                      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-md flex items-center gap-1">
                        <CalendarDays size={12} />
                        {nextSchedule.date}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-base font-semibold text-text-primary mb-1 group-hover:text-accent transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-sm text-text-secondary line-clamp-2 mb-3 leading-relaxed">
                      {service.description}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-text-tertiary mb-3">
                      {service.capacity && (
                        <span className="flex items-center gap-1">
                          <Users size={13} />
                          定員 {service.capacity}名
                        </span>
                      )}
                      {service.duration && (
                        <span className="flex items-center gap-1">
                          <Clock size={13} />
                          {service.duration}分
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border-light">
                      <span className="text-lg font-bold text-text-primary">
                        &yen;{service.price.toLocaleString()}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-accent group-hover:gap-2 transition-all">
                        詳細を見る
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Reviews Section */}
      <section className="bg-white border-t border-border-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary">
              生徒さんの声
            </h2>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Star size={16} className="fill-accent text-accent" />
              <span className="font-semibold">{avgRating.toFixed(1)}</span>
              <span className="text-text-tertiary">
                ({reviews.length}件)
              </span>
            </div>
          </div>

          {displayedReviews.length === 0 ? (
            <p className="text-text-tertiary text-sm py-8 text-center">
              まだレビューはありません
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {displayedReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-bg-primary rounded-xl border border-border-light p-5"
                >
                  <StarRating rating={review.rating} size={14} />
                  <p className="text-sm text-text-secondary mt-3 mb-4 leading-relaxed line-clamp-4">
                    {review.comment}
                  </p>
                  <div className="flex items-center justify-between text-xs text-text-tertiary">
                    <span className="font-medium text-text-primary">
                      {review.customerName}
                    </span>
                    <time>{review.createdAt}</time>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Classroom Info */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="text-xl font-bold text-text-primary mb-5">
          教室情報
        </h2>
        <div className="bg-white rounded-xl border border-border-light p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
            {schoolLocation && (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <MapPin size={16} className="text-accent shrink-0" />
                {schoolLocation}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Clock size={16} className="text-accent shrink-0" />
              レッスン時間 120〜180分
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Users size={16} className="text-accent shrink-0" />
              少人数制（最大8名）
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

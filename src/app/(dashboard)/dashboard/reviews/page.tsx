"use client";

import { useState, useMemo } from "react";
import { Star, MessageSquare, CheckCircle, Send } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";

export default function ReviewsPage() {
  const { reviews, updateReview, services } = useDashboard();

  const [serviceFilter, setServiceFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [replyFilter, setReplyFilter] = useState("all");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // Stats
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews]);

  const repliedCount = useMemo(
    () => reviews.filter((r) => r.reply).length,
    [reviews]
  );

  // Rating distribution
  const ratingDistribution = useMemo(() => {
    const dist = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      dist[r.rating - 1]++;
    });
    return dist;
  }, [reviews]);

  const maxDistribution = Math.max(...ratingDistribution, 1);

  // Unique service names for filter
  const serviceNames = useMemo(() => {
    const names = new Set(reviews.map((r) => r.serviceName));
    return Array.from(names);
  }, [reviews]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (serviceFilter !== "all" && r.serviceName !== serviceFilter)
        return false;
      if (ratingFilter !== "all" && r.rating !== Number(ratingFilter))
        return false;
      if (replyFilter === "replied" && !r.reply) return false;
      if (replyFilter === "unreplied" && r.reply) return false;
      return true;
    });
  }, [reviews, serviceFilter, ratingFilter, replyFilter]);

  // Star rendering
  const renderStars = (rating: number) => {
    return (
      <span className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={16}
            className={
              i <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-200 fill-gray-200"
            }
          />
        ))}
      </span>
    );
  };

  // Big star display for stat card
  const renderBigStars = (rating: number) => {
    const full = Math.floor(rating);
    const hasHalf = rating - full >= 0.3;
    return (
      <span className="flex items-center gap-0.5 mt-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={20}
            className={
              i <= full
                ? "text-yellow-400 fill-yellow-400"
                : i === full + 1 && hasHalf
                  ? "text-yellow-400 fill-yellow-400/50"
                  : "text-gray-200 fill-gray-200"
            }
          />
        ))}
      </span>
    );
  };

  const handleSubmitReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    updateReview(reviewId, {
      reply: replyText.trim(),
      repliedAt: new Date().toISOString().slice(0, 10),
    });
    setReplyingTo(null);
    setReplyText("");
  };

  return (
    <div className="p-8">
      {/* Header */}
      <h1 className="text-2xl font-bold text-text-primary mb-6">
        感想レポート
      </h1>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* Average Rating */}
        <div className="bg-white rounded-xl border border-border-light p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-text-secondary">平均評価</span>
            <Star size={20} className="text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-text-primary">{averageRating}</p>
          {renderBigStars(averageRating)}
        </div>

        <StatCard
          label="レビュー総数"
          value={`${reviews.length}件`}
          icon={MessageSquare}
          iconColor="text-info"
        />

        <StatCard
          label="返信済み"
          value={`${repliedCount} / ${reviews.length}`}
          change={`返信率 ${reviews.length > 0 ? Math.round((repliedCount / reviews.length) * 100) : 0}%`}
          icon={CheckCircle}
          iconColor="text-success"
        />
      </div>

      {/* Rating Distribution */}
      <div className="bg-white rounded-xl border border-border-light p-6 mb-6">
        <h2 className="text-lg font-bold text-text-primary mb-4">
          評価分布
        </h2>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingDistribution[star - 1];
            const pct = maxDistribution > 0 ? (count / maxDistribution) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3">
                <span className="text-sm font-medium text-text-secondary w-8 text-right">
                  {star}
                </span>
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <div className="flex-1 h-6 bg-bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-sm text-text-tertiary w-8">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white rounded-xl border border-border-light p-4 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="border border-border rounded-lg px-3 py-2.5 text-sm text-text-secondary focus:border-primary focus:outline-none"
          >
            <option value="all">すべてのサービス</option>
            {serviceNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="border border-border rounded-lg px-3 py-2.5 text-sm text-text-secondary focus:border-primary focus:outline-none"
          >
            <option value="all">すべての評価</option>
            <option value="5">5</option>
            <option value="4">4</option>
            <option value="3">3</option>
            <option value="2">2</option>
            <option value="1">1</option>
          </select>

          <select
            value={replyFilter}
            onChange={(e) => setReplyFilter(e.target.value)}
            className="border border-border rounded-lg px-3 py-2.5 text-sm text-text-secondary focus:border-primary focus:outline-none"
          >
            <option value="all">すべて</option>
            <option value="replied">返信済み</option>
            <option value="unreplied">未返信</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-xl border border-border-light p-12 text-center">
            <MessageSquare size={40} className="text-border mx-auto mb-3" />
            <p className="text-sm text-text-tertiary">
              条件に一致するレビューはありません
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl border border-border-light p-6"
            >
              {/* Top: Avatar, Name, Stars, Date */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold">
                    {review.customerName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary">
                        {review.customerName}
                      </span>
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-xs text-text-tertiary">
                      {review.createdAt}
                    </span>
                  </div>
                </div>
                <Badge status={review.serviceId.startsWith("s") ? (() => {
                  const svc = services.find((s) => s.id === review.serviceId);
                  return svc?.type || "group-lesson";
                })() : "group-lesson"} />
              </div>

              {/* Service badge */}
              <div className="mb-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-bg-secondary text-xs font-medium text-text-secondary">
                  {review.serviceName}
                </span>
              </div>

              {/* Comment */}
              <p className="text-sm text-text-primary leading-relaxed mb-4">
                {review.comment}
              </p>

              {/* Reply Section */}
              {review.reply ? (
                <div className="bg-bg-secondary rounded-lg p-4 border-l-4 border-accent">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success/10 text-success">
                      返信済み
                    </span>
                    <span className="text-xs text-text-tertiary">
                      {review.repliedAt}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {review.reply}
                  </p>
                </div>
              ) : replyingTo === review.id ? (
                <div className="border border-border rounded-lg p-4">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="返信を入力..."
                    rows={3}
                    className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 resize-none mb-3"
                  />
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText("");
                      }}
                      className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={() => handleSubmitReply(review.id)}
                      className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors flex items-center gap-2"
                    >
                      <Send size={14} />
                      返信を送信
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setReplyingTo(review.id);
                    setReplyText("");
                  }}
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary-hover font-medium transition-colors"
                >
                  <MessageSquare size={14} />
                  返信する
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

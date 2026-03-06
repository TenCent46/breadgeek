"use client";

import { useState } from "react";
import { Star, MessageSquare } from "lucide-react";

interface ReviewItem {
  id: string;
  lessonTitle: string;
  schoolName: string;
  rating: number;
  comment: string;
  reply: string | null;
  createdAt: string;
}

interface ReviewableItem {
  serviceId: string;
  customerId: string;
  lessonTitle: string;
  schoolName: string;
}

function StarInput({ rating, onChange }: { rating: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className="focus:outline-none"
        >
          <Star
            size={24}
            className={`transition-colors ${
              i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewForm({ item, onSubmitted }: { item: ReviewableItem; onSubmitted: () => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: item.serviceId,
          customerId: item.customerId,
          rating,
          comment,
        }),
      });
      if (res.ok) {
        onSubmitted();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border-light p-5 space-y-4">
      <div>
        <p className="font-semibold text-text-primary">{item.lessonTitle}</p>
        <p className="text-sm text-text-secondary">{item.schoolName}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-text-primary mb-2">評価</p>
        <StarInput rating={rating} onChange={setRating} />
      </div>
      <div>
        <p className="text-sm font-medium text-text-primary mb-2">コメント</p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full border border-border-light rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent resize-none"
          placeholder="レッスンの感想を書いてください"
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={rating === 0 || submitting}
        className="bg-accent text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
      >
        {submitting ? "送信中..." : "レビューを投稿"}
      </button>
    </div>
  );
}

export function ReviewsClient({
  reviews,
  reviewable,
}: {
  reviews: ReviewItem[];
  reviewable: ReviewableItem[];
}) {
  const [reviewableList, setReviewableList] = useState(reviewable);

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">レビュー</h1>

      {/* Reviewable lessons */}
      {reviewableList.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            レビューを書く
          </h2>
          <div className="space-y-4">
            {reviewableList.map((item) => (
              <ReviewForm
                key={item.serviceId}
                item={item}
                onSubmitted={() => {
                  setReviewableList((prev) =>
                    prev.filter((r) => r.serviceId !== item.serviceId)
                  );
                  window.location.reload();
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past reviews */}
      <h2 className="text-lg font-semibold text-text-primary mb-4">
        投稿済みレビュー ({reviews.length})
      </h2>
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare size={48} className="mx-auto mb-4 text-text-placeholder" />
          <p className="text-text-tertiary">まだレビューはありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl border border-border-light p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-text-primary">{review.lessonTitle}</p>
                  <p className="text-sm text-text-secondary">{review.schoolName}</p>
                </div>
                <span className="text-xs text-text-tertiary">
                  {new Date(review.createdAt).toLocaleDateString("ja-JP")}
                </span>
              </div>
              <div className="flex items-center gap-0.5 mb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                  />
                ))}
              </div>
              <p className="text-sm text-text-secondary">{review.comment}</p>
              {review.reply && (
                <div className="mt-3 pl-4 border-l-2 border-accent/30">
                  <p className="text-xs font-medium text-accent mb-1">講師からの返信</p>
                  <p className="text-sm text-text-secondary">{review.reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

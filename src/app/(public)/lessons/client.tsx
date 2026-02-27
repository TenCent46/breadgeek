"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { ServiceSearchDoc, SchoolSearchDoc } from "@/lib/meilisearch";
import {
  Search,
  MapPin,
  Clock,
  Users,
  Star,
  CalendarDays,
  Wheat,
  ArrowRight,
  SlidersHorizontal,
  X,
} from "lucide-react";

const LESSON_IMAGES = [
  "https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=600&q=80&auto=format&fit=crop",
];

const TYPE_LABELS: Record<string, string> = {
  GROUP_LESSON: "グループレッスン",
  MASTER_COURSE: "マスターコース",
  TRIAL_LESSON: "体験レッスン",
  "group-lesson": "グループレッスン",
  "master-course": "マスターコース",
  "trial-lesson": "体験レッスン",
};

const CATEGORIES = [
  "すべて",
  "食パン系",
  "ハード系",
  "菓子パン系",
  "天然酵母",
  "季節限定",
] as const;

interface LessonsClientProps {
  initialResults: ServiceSearchDoc[];
  schools: SchoolSearchDoc[];
  meilisearchHost: string;
  meilisearchKey: string;
}

export function LessonsClient({
  initialResults,
  schools,
  meilisearchHost,
  meilisearchKey,
}: LessonsClientProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("すべて");
  const [results, setResults] = useState<ServiceSearchDoc[]>(initialResults);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filteredResults = useMemo(() => {
    let filtered = results;

    // Client-side category filter
    if (activeCategory !== "すべて") {
      filtered = filtered.filter((r) => r.category === activeCategory);
    }

    // Client-side text filter (when no Meilisearch)
    if (!meilisearchHost && query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.schoolName.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [results, activeCategory, query, meilisearchHost]);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);

    if (!meilisearchHost || !searchQuery.trim()) {
      setResults(initialResults);
      return;
    }

    setIsSearching(true);
    try {
      const { MeiliSearch } = await import("meilisearch");
      const client = new MeiliSearch({
        host: meilisearchHost,
        apiKey: meilisearchKey,
      });
      const searchResults = await client.index("services").search<ServiceSearchDoc>(searchQuery, {
        limit: 50,
      });
      setResults(searchResults.hits);
    } catch {
      // Fallback to initial results on error
      setResults(initialResults);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* ─── Hero / Search Bar ─── */}
      <section className="bg-white border-b border-border-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
            <Wheat size={28} className="inline-block mr-2 -mt-1 text-accent" />
            レッスンを探す
          </h1>
          <p className="text-text-secondary mb-6">
            全国のパン教室からお気に入りのレッスンを見つけましょう
          </p>

          {/* Search bar */}
          <div className="relative max-w-2xl">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="レッスン名、パンの種類、教室名で検索..."
              className="w-full border border-border rounded-xl pl-12 pr-12 py-3.5 text-base focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/10 transition-colors"
            />
            {query && (
              <button
                onClick={() => handleSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ─── Category Filter ─── */}
      <section className="sticky top-0 z-20 bg-white border-b border-border-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
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
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="shrink-0 ml-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
            >
              <SlidersHorizontal size={16} />
              フィルター
            </button>
          </div>
        </div>
      </section>

      {/* ─── Results ─── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main results */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-text-tertiary">
                {isSearching
                  ? "検索中..."
                  : `${filteredResults.length}件のレッスン`}
              </p>
            </div>

            {filteredResults.length === 0 ? (
              <div className="py-20 text-center">
                <CalendarDays
                  size={48}
                  className="mx-auto mb-4 text-text-placeholder"
                />
                <p className="text-text-secondary font-medium mb-1">
                  レッスンが見つかりません
                </p>
                <p className="text-text-tertiary text-sm">
                  検索条件を変更してお試しください
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredResults.map((service, idx) => (
                  <Link
                    key={service.id}
                    href={`/p/${service.schoolSlug}/${service.id}`}
                    className="group bg-white rounded-xl border border-border-light overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={
                          service.imageUrl ||
                          LESSON_IMAGES[idx % LESSON_IMAGES.length]
                        }
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-white/90 backdrop-blur-sm text-xs font-medium px-2.5 py-1 rounded-md text-text-primary">
                          {TYPE_LABELS[service.type] || service.type}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <p className="text-xs text-accent font-medium mb-1">
                        {service.schoolName}
                      </p>
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
                        {service.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={13} />
                            {service.location}
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
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: Schools */}
          {schools.length > 1 && (
            <div className="lg:w-72 shrink-0">
              <div className="lg:sticky lg:top-20">
                <h3 className="text-sm font-semibold text-text-primary mb-3">
                  教室一覧
                </h3>
                <div className="space-y-2">
                  {schools.map((school) => (
                    <Link
                      key={school.id}
                      href={`/p/${school.slug}`}
                      className="block bg-white rounded-lg border border-border-light p-3 hover:shadow-sm transition-shadow"
                    >
                      <p className="text-sm font-medium text-text-primary">
                        {school.name}
                      </p>
                      {school.location && (
                        <p className="text-xs text-text-tertiary flex items-center gap-1 mt-1">
                          <MapPin size={12} />
                          {school.location}
                        </p>
                      )}
                      <p className="text-xs text-text-tertiary mt-1">
                        {school.serviceCount}レッスン
                        {school.avgRating > 0 && (
                          <span className="ml-2">
                            <Star
                              size={11}
                              className="inline -mt-0.5 fill-accent text-accent"
                            />{" "}
                            {school.avgRating}
                          </span>
                        )}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

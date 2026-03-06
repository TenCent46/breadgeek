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
  ChevronDown,
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

const PRICE_RANGES = [
  { label: "すべて", min: 0, max: Infinity },
  { label: "~3,000円", min: 0, max: 3000 },
  { label: "3,000~5,000円", min: 3000, max: 5000 },
  { label: "5,000~10,000円", min: 5000, max: 10000 },
  { label: "10,000円~", min: 10000, max: Infinity },
];

const SORT_OPTIONS = [
  { label: "新着順", value: "newest" },
  { label: "価格が安い順", value: "price_asc" },
  { label: "価格が高い順", value: "price_desc" },
  { label: "日程が近い順", value: "date_asc" },
] as const;

interface LessonsClientProps {
  initialResults: ServiceSearchDoc[];
  schools: SchoolSearchDoc[];
  regions: string[];
  meilisearchHost: string;
  meilisearchKey: string;
}

export function LessonsClient({
  initialResults,
  schools,
  regions,
  meilisearchHost,
  meilisearchKey,
}: LessonsClientProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("すべて");
  const [results, setResults] = useState<ServiceSearchDoc[]>(initialResults);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("すべて");
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState<string>("newest");

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedRegion !== "すべて") count++;
    if (selectedPriceRange !== 0) count++;
    if (onlyAvailable) count++;
    return count;
  }, [selectedRegion, selectedPriceRange, onlyAvailable]);

  const filteredResults = useMemo(() => {
    let filtered = results;

    // Category filter
    if (activeCategory !== "すべて") {
      filtered = filtered.filter((r) => r.category === activeCategory);
    }

    // Region filter
    if (selectedRegion !== "すべて") {
      filtered = filtered.filter((r) => r.region === selectedRegion);
    }

    // Price range filter
    const priceRange = PRICE_RANGES[selectedPriceRange];
    if (priceRange.min > 0 || priceRange.max < Infinity) {
      filtered = filtered.filter(
        (r) => r.price >= priceRange.min && r.price <= priceRange.max
      );
    }

    // Availability filter
    if (onlyAvailable) {
      filtered = filtered.filter((r) => r.hasAvailability);
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

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        case "date_asc": {
          const dateA = a.nextScheduleDate ? new Date(a.nextScheduleDate).getTime() : Infinity;
          const dateB = b.nextScheduleDate ? new Date(b.nextScheduleDate).getTime() : Infinity;
          return dateA - dateB;
        }
        default:
          return 0; // keep server order (newest)
      }
    });

    return filtered;
  }, [results, activeCategory, selectedRegion, selectedPriceRange, onlyAvailable, query, meilisearchHost, sortBy]);

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
      setResults(initialResults);
    } finally {
      setIsSearching(false);
    }
  };

  const clearFilters = () => {
    setSelectedRegion("すべて");
    setSelectedPriceRange(0);
    setOnlyAvailable(false);
    setSortBy("newest");
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Hero / Search Bar */}
      <section className="bg-white border-b border-border-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
            <Wheat size={28} className="inline-block mr-2 -mt-1 text-accent" />
            レッスンを探す
          </h1>
          <p className="text-text-secondary mb-6">
            全国のパン教室からお気に入りのレッスンを見つけましょう
          </p>

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

      {/* Category Filter + Sort */}
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
            <div className="flex items-center gap-2 shrink-0 ml-4">
              {/* Sort dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-bg-secondary text-text-secondary text-sm pl-3 pr-8 py-1.5 rounded-lg cursor-pointer hover:bg-bg-tertiary transition-colors"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  activeFilterCount > 0
                    ? "bg-accent/10 text-accent font-medium"
                    : "text-text-secondary hover:bg-bg-secondary"
                }`}
              >
                <SlidersHorizontal size={16} />
                フィルター
                {activeFilterCount > 0 && (
                  <span className="bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Panel */}
      {showFilters && (
        <section className="bg-white border-b border-border-light">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
            <div className="flex flex-wrap gap-6">
              {/* Region */}
              <div>
                <label className="block text-xs font-medium text-text-tertiary mb-2">地域</label>
                <div className="flex flex-wrap gap-1.5">
                  {["すべて", ...regions].map((r) => (
                    <button
                      key={r}
                      onClick={() => setSelectedRegion(r)}
                      className={`px-3 py-1 rounded-md text-sm transition-colors ${
                        selectedRegion === r
                          ? "bg-accent text-white"
                          : "bg-bg-secondary text-text-secondary hover:bg-bg-tertiary"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-xs font-medium text-text-tertiary mb-2">価格帯</label>
                <div className="flex flex-wrap gap-1.5">
                  {PRICE_RANGES.map((range, i) => (
                    <button
                      key={range.label}
                      onClick={() => setSelectedPriceRange(i)}
                      className={`px-3 py-1 rounded-md text-sm transition-colors ${
                        selectedPriceRange === i
                          ? "bg-accent text-white"
                          : "bg-bg-secondary text-text-secondary hover:bg-bg-tertiary"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-xs font-medium text-text-tertiary mb-2">空き状況</label>
                <button
                  onClick={() => setOnlyAvailable(!onlyAvailable)}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    onlyAvailable
                      ? "bg-accent text-white"
                      : "bg-bg-secondary text-text-secondary hover:bg-bg-tertiary"
                  }`}
                >
                  空きありのみ
                </button>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="mt-3 text-sm text-accent hover:underline"
              >
                フィルターをクリア
              </button>
            )}
          </div>
        </section>
      )}

      {/* Results */}
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
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <span className="bg-white/90 backdrop-blur-sm text-xs font-medium px-2.5 py-1 rounded-md text-text-primary">
                          {TYPE_LABELS[service.type] || service.type}
                        </span>
                        {service.hasAvailability && (
                          <span className="bg-success/90 backdrop-blur-sm text-xs font-medium px-2.5 py-1 rounded-md text-white">
                            空きあり
                          </span>
                        )}
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
                        {service.nextScheduleDate && (
                          <span className="flex items-center gap-1">
                            <CalendarDays size={13} />
                            {new Date(service.nextScheduleDate).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}~
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

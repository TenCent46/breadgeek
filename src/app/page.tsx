import { Logo } from "@/components/ui/logo";
import Link from "next/link";
import {
  Calculator,
  Wheat,
  Package,
  RefreshCw,
  CalendarDays,
  BarChart3,
  ArrowRight,
  Star,
  ChevronRight,
  MessageSquare,
} from "lucide-react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1920&q=80&auto=format&fit=crop";
const CTA_BG_IMAGE =
  "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=1920&q=80&auto=format&fit=crop";

const features = [
  {
    icon: Calculator,
    title: "利益シミュレーション",
    description:
      "レッスン単価・定員・稼働率を入力するだけで、月次の利益予測をリアルタイムに算出。値付けの迷いをなくします。",
  },
  {
    icon: Wheat,
    title: "レシピ原価管理",
    description:
      "材料費を登録してレシピに紐づけるだけで、1レッスンあたりの原価を自動計算。利益率が一目でわかります。",
  },
  {
    icon: Package,
    title: "材料在庫管理",
    description:
      "粉・バター・酵母などの在庫をリアルタイムで把握。発注タイミングの見逃しやロスを防ぎます。",
  },
  {
    icon: RefreshCw,
    title: "リピート率分析",
    description:
      "生徒さんのリピート率・離脱率を自動集計。ファン化に効果的な施策が見えてきます。",
  },
  {
    icon: CalendarDays,
    title: "レッスン予約・決済",
    description:
      "予約受付からオンライン決済までワンストップ。回数券やサブスクにも対応しています。",
  },
  {
    icon: BarChart3,
    title: "稼働率・収益分析",
    description:
      "曜日・時間帯別の稼働率と収益をダッシュボードで可視化。空き枠の最適活用を支援します。",
  },
];

const testimonials = [
  {
    name: "佐藤洋平",
    role: "パン教室主宰 10年",
    comment:
      "感覚で決めていたレッスン料金を、原価と利益率から逆算できるようになりました。値上げの根拠を生徒さんにも説明できて安心です。",
    rating: 5,
  },
  {
    name: "田中美咲",
    role: "自宅パン教室 3年",
    comment:
      "材料費がいくらかかっているか正直把握できていませんでした。レシピ原価が見える化されて、無駄な仕入れが激減しました。",
    rating: 5,
  },
  {
    name: "高橋裕子",
    role: "パン教室&カフェ経営",
    comment:
      "リピート率の分析で、どのレッスンがファンを生んでいるか一目瞭然に。新メニュー開発の方向性が明確になりました。",
    rating: 5,
  },
];

const pricingFeatures = [
  "利益シミュレーション",
  "レシピ原価管理（無制限）",
  "材料在庫管理",
  "リピート率分析",
  "レッスン予約・決済",
  "稼働率・収益ダッシュボード",
  "メッセージ配信",
  "AIアシスタント（Beta）",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* ─── Header ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/80 backdrop-blur-lg border-b border-border-light">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3.5">
          <Logo />
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm text-text-secondary hover:text-primary transition-colors"
            >
              機能
            </a>
            <a
              href="#pricing"
              className="text-sm text-text-secondary hover:text-primary transition-colors"
            >
              料金
            </a>
            <a
              href="#testimonials"
              className="text-sm text-text-secondary hover:text-primary transition-colors"
            >
              お客様の声
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/lessons"
              className="text-sm text-accent font-medium hover:text-accent-light transition-colors"
            >
              レッスンを探す
            </Link>
            <Link
              href="/login"
              className="text-sm text-text-secondary hover:text-primary transition-colors"
            >
              ログイン
            </Link>
            <Link
              href="/dashboard"
              className="bg-accent text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-accent-light transition-all hover:shadow-lg"
            >
              デモを試す
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative pt-20 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src={HERO_IMAGE}
            alt="焼きたてのパン"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#3D2B1F]/90 via-[#3D2B1F]/75 to-[#3D2B1F]/50" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-28 md:py-40">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white/90 px-4 py-1.5 rounded-full text-sm mb-6 animate-fade-up">
              <Wheat size={14} />
              パン教室専用・利益管理OS
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6 animate-fade-up-delay-1">
              パン教室の利益を、
              <br />
              <span className="text-accent-light">見える化</span>しよう
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed animate-fade-up-delay-2">
              レシピ原価管理・リピート率分析・利益シミュレーション。
              <br className="hidden md:block" />
              「なんとなく経営」から「数字で伸ばす教室運営」へ。
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-4 animate-fade-up-delay-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-accent text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-accent-light transition-all hover:shadow-xl shadow-accent/30"
              >
                デモを体験する
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/lessons"
                className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-white/25 transition-all"
              >
                生徒としてレッスンを探す
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg
            viewBox="0 0 1440 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0V40Z"
              fill="var(--color-bg-primary)"
            />
          </svg>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-24 bg-bg-primary">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 text-accent text-sm font-medium tracking-wide mb-3">
              <Wheat size={14} />
              FEATURES
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              パン教室経営に必要な
              <br className="md:hidden" />
              すべてを、ひとつに
            </h2>
            <p className="text-text-secondary max-w-lg mx-auto">
              原価計算からリピート分析まで。利益を最大化するための6つの機能を搭載しています。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group bg-bg-primary rounded-2xl p-7 border border-border-light hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 animate-fade-up"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors">
                  <feature.icon size={22} className="text-accent" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA with bread image ─── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={CTA_BG_IMAGE}
            alt="焼きたてのパン"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#3D2B1F]/80" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <span className="inline-flex items-center gap-1.5 text-accent-light text-sm font-medium tracking-wide mb-3">
              <Wheat size={14} />
              FOR BREAD SCHOOLS
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-snug">
              「好き」を仕事にした先の、
              <br />
              利益の不安を解消する
            </h2>
            <p className="text-white/70 leading-relaxed mb-10 max-w-lg mx-auto">
              レッスンの準備に追われて、利益計算は後回し。
              そんな日々に終止符を打ちませんか。
              BreadGeekがあなたの教室経営を数字で支えます。
            </p>
            <div className="space-y-4 text-left max-w-sm mx-auto mb-10">
              {[
                "レシピごとの原価と利益率を自動算出",
                "リピート率の推移をグラフで把握",
                "月次利益をシミュレーションで予測",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                    <ChevronRight size={14} className="text-accent-light" />
                  </div>
                  <span className="text-sm text-white font-medium">
                    {item}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 bg-accent text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-accent-light transition-all hover:shadow-xl shadow-accent/30"
            >
              無料ではじめる
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section id="testimonials" className="py-24 bg-bg-primary">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 text-accent text-sm font-medium tracking-wide mb-3">
              <MessageSquare size={14} />
              TESTIMONIALS
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              お客様の声
            </h2>
            <p className="text-text-secondary max-w-lg mx-auto">
              BreadGeekを活用されているパン教室の先生方の声をご紹介します。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-bg-primary rounded-2xl p-7 border border-border-light animate-fade-up"
              >
                <div className="flex items-center gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < t.rating
                          ? "text-accent fill-accent"
                          : "text-border fill-border"
                      }
                    />
                  ))}
                </div>
                <p className="text-sm text-text-primary leading-relaxed mb-6">
                  &ldquo;{t.comment}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-accent">
                      {t.name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">
                      {t.name}
                    </p>
                    <p className="text-xs text-text-tertiary">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-24 bg-bg-tertiary">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 text-accent text-sm font-medium tracking-wide mb-3">
              <Wheat size={14} />
              PRICING
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              シンプルな料金体系
            </h2>
            <p className="text-text-secondary">
              初期費用・月額費用は無料。売上が発生した時のみ手数料がかかります。
            </p>
          </div>

          <div className="max-w-md mx-auto bg-bg-primary rounded-2xl border border-border-light p-8 shadow-lg shadow-primary/5">
            <div className="text-center">
              <p className="text-sm text-text-secondary mb-2">
                パン教室プラン
              </p>
              <div className="flex items-baseline justify-center gap-1 mb-1">
                <span className="text-5xl font-bold text-text-primary">
                  ¥0
                </span>
                <span className="text-text-tertiary">/月</span>
              </div>
              <p className="text-sm text-text-tertiary mb-8">
                決済手数料 3.6% のみ
              </p>
              <div className="space-y-3 text-left mb-8">
                {pricingFeatures.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                      <ChevronRight size={12} className="text-accent" />
                    </div>
                    <span className="text-sm text-text-primary">{item}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/onboarding"
                className="block w-full bg-primary text-white py-3.5 rounded-full text-sm font-medium hover:bg-primary-hover transition-all hover:shadow-lg text-center"
              >
                無料ではじめる
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={HERO_IMAGE}
            alt="パン"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#3D2B1F]/85" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            あなたのパン教室を、
            <br />
            もっと利益の出る教室へ
          </h2>
          <p className="text-white/70 mb-10">
            無料登録で、すべての利益管理機能をお試しいただけます。
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 bg-accent text-white px-10 py-4 rounded-full text-lg font-medium hover:bg-accent-light transition-all hover:shadow-xl shadow-accent/30"
          >
            無料ではじめる
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-[#3D2B1F] py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Wheat size={20} className="text-accent-light" />
              <span className="text-lg font-bold text-white">
                BREAD<span className="text-accent-light">GEEK</span>
              </span>
            </div>
            <div className="flex items-center gap-8">
              <a
                href="#"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                利用規約
              </a>
              <a
                href="#"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                プライバシーポリシー
              </a>
              <a
                href="#"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                特定商取引法
              </a>
              <a
                href="#"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                お問い合わせ
              </a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-white/40">
              &copy; 2026 BreadGeek. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

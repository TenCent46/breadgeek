"use client";

import Link from "next/link";
import {
  TrendingUp,
  Users,
  CalendarDays,
  Plus,
  ArrowUpRight,
  BarChart3,
  Send,
  Star,
  CheckCircle2,
  Circle,
  CreditCard,
  AlertTriangle,
  BookOpen,
  UtensilsCrossed,
  Package,
  Settings,
  Percent,
  Activity,
} from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";
import { Badge } from "@/components/ui/badge";

export default function DashboardHome() {
  const {
    bookings,
    customers,
    sales,
    monthlySales,
    monthlyProfit,
    reviews,
    services,
    recipes,
    ingredients,
  } = useDashboard();

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // ─── Stat calculations ───
  const monthSales = sales.filter(
    (s) => s.date.startsWith(thisMonth) && s.status === "completed"
  );
  const monthRevenue = monthSales.reduce((sum, s) => sum + s.amount, 0);

  // 今月利益
  const currentMonthProfit = monthlyProfit.find((mp) =>
    mp.month.startsWith(thisMonth)
  );
  const profitAmount = currentMonthProfit?.profit ?? 0;

  // リピート率 (avg customer repeatRate)
  const avgRepeatRate =
    customers.length > 0
      ? Math.round(
          customers.reduce((sum, c) => sum + c.repeatRate, 0) /
            customers.length
        )
      : 0;

  // 1席あたり売上
  const totalCapacity = services.reduce(
    (sum, s) => sum + (s.capacity || 0),
    0
  );
  const perSeatRevenue =
    totalCapacity > 0 ? Math.round(monthRevenue / totalCapacity) : 0;

  // 稼働率
  const monthBookings = bookings.filter(
    (b) =>
      b.date.startsWith(thisMonth) &&
      b.status !== "cancelled"
  );
  const utilizationRate =
    totalCapacity > 0
      ? Math.min(
          100,
          Math.round((monthBookings.length / totalCapacity) * 100)
        )
      : 0;

  // Upcoming bookings
  const upcomingBookings = bookings
    .filter(
      (b) =>
        b.date >= now.toISOString().slice(0, 10) && b.status !== "cancelled"
    )
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)
    )
    .slice(0, 5);

  // Getting started checklist (bread-specific)
  const checks = [
    {
      label: "レッスンを作成する",
      done: services.length > 0,
      href: "/dashboard/services/new",
    },
    {
      label: "レシピを登録する",
      done: recipes.length > 0,
      href: "/dashboard/recipes/new",
    },
    {
      label: "材料を登録する",
      done: ingredients.length > 0,
      href: "/dashboard/ingredients",
    },
    {
      label: "決済を連携する",
      done: false,
      href: "/dashboard/settings",
    },
  ];
  const completedChecks = checks.filter((c) => c.done).length;

  // Ingredient alerts
  const lowStockIngredients = ingredients.filter(
    (i) => i.currentStockGrams < i.reorderThresholdGrams
  );

  // 7-day profit mini bar chart
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const dayProfit = sales
      .filter((s) => s.date === dateStr && s.status === "completed")
      .reduce((sum, s) => sum + s.profit, 0);
    return {
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      profit: dayProfit,
    };
  });
  const maxProfit = Math.max(...last7.map((d) => Math.abs(d.profit)), 1);

  const stats = [
    {
      label: "今月利益",
      value: `\u00a5${profitAmount.toLocaleString()}`,
      change: currentMonthProfit
        ? `利益率 ${Math.round((currentMonthProfit.profit / (currentMonthProfit.revenue || 1)) * 100)}%`
        : "-",
      icon: TrendingUp,
      color: "text-success",
    },
    {
      label: "リピート率",
      value: `${avgRepeatRate}%`,
      change: `${customers.filter((c) => c.tier === "repeater").length}人のリピーター`,
      icon: Percent,
      color: "text-accent",
    },
    {
      label: "1席あたり売上",
      value: `\u00a5${perSeatRevenue.toLocaleString()}`,
      change: `総定員 ${totalCapacity}席`,
      icon: BarChart3,
      color: "text-info",
    },
    {
      label: "稼働率",
      value: `${utilizationRate}%`,
      change: `今月 ${monthBookings.length}件の予約`,
      icon: Activity,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-text-primary">ホーム</h1>
        <Link
          href="/dashboard/services/new"
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus size={16} />
          新規レッスンを作成
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-border-light p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-text-secondary">{stat.label}</span>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
            <p className="text-xs text-text-tertiary mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Getting Started Checklist */}
      {completedChecks < checks.length && (
        <div className="bg-white rounded-xl border border-border-light p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-primary">
              はじめましょう
            </h2>
            <span className="text-sm text-text-tertiary">
              {completedChecks}/{checks.length} 完了
            </span>
          </div>
          <div className="w-full bg-bg-secondary rounded-full h-2 mb-4">
            <div
              className="bg-accent h-2 rounded-full transition-all"
              style={{
                width: `${(completedChecks / checks.length) * 100}%`,
              }}
            />
          </div>
          <div className="space-y-2">
            {checks.map((check) => (
              <Link
                key={check.label}
                href={check.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-bg-secondary transition-colors"
              >
                {check.done ? (
                  <CheckCircle2 size={20} className="text-success shrink-0" />
                ) : (
                  <Circle size={20} className="text-border shrink-0" />
                )}
                <span
                  className={`text-sm ${check.done ? "text-text-tertiary line-through" : "text-text-primary"}`}
                >
                  {check.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Ingredient Alerts */}
      {lowStockIngredients.length > 0 && (
        <div className="bg-warning/5 border border-warning/30 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={20} className="text-warning" />
            <h2 className="text-lg font-bold text-text-primary">
              材料アラート
            </h2>
            <span className="text-sm text-text-tertiary ml-auto">
              {lowStockIngredients.length}件
            </span>
          </div>
          <div className="space-y-2">
            {lowStockIngredients.map((ing) => (
              <div
                key={ing.id}
                className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-warning/20"
              >
                <div className="flex items-center gap-3">
                  <Package size={16} className="text-warning" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {ing.name}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {ing.category} / {ing.supplier}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-warning">
                    残り {ing.currentStockGrams}g
                  </p>
                  <p className="text-xs text-text-tertiary">
                    発注基準: {ing.reorderThresholdGrams}g
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-xl border border-border-light p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-primary">
              直近の予約
            </h2>
            <Link
              href="/dashboard/bookings"
              className="text-sm text-accent hover:underline flex items-center gap-1"
            >
              すべて見る <ArrowUpRight size={14} />
            </Link>
          </div>
          {upcomingBookings.length > 0 ? (
            <div className="space-y-3">
              {upcomingBookings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between py-2.5 border-b border-border-light last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-bg-secondary flex items-center justify-center shrink-0">
                      <CalendarDays
                        size={18}
                        className="text-text-tertiary"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {b.serviceName}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        {b.date} {b.startTime}〜{b.endTime} ・{" "}
                        {b.customerName}
                      </p>
                    </div>
                  </div>
                  <Badge status={b.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarDays size={40} className="text-border mb-3" />
              <p className="text-sm text-text-tertiary">
                まだ予約はありません
              </p>
              <p className="text-xs text-text-placeholder mt-1">
                レッスンを作成して予約を受け付けましょう
              </p>
            </div>
          )}
        </div>

        {/* 7-Day Profit Mini Bar Chart */}
        <div className="bg-white rounded-xl border border-border-light p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-primary">
              7日間の利益
            </h2>
            <Link
              href="/dashboard/sales"
              className="text-sm text-accent hover:underline flex items-center gap-1"
            >
              詳細を見る <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="flex items-end justify-between gap-2 h-40 pt-4">
            {last7.map((d) => (
              <div
                key={d.date}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <span className="text-[10px] text-text-tertiary">
                  {d.profit !== 0
                    ? `\u00a5${(d.profit / 1000).toFixed(0)}k`
                    : ""}
                </span>
                <div
                  className={`w-full rounded-t transition-all ${d.profit >= 0 ? "bg-success/80" : "bg-error/60"}`}
                  style={{
                    height: `${d.profit !== 0 ? Math.max((Math.abs(d.profit) / maxProfit) * 120, 4) : 4}px`,
                  }}
                />
                <span className="text-[10px] text-text-tertiary">
                  {d.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-border-light p-6">
          <h2 className="text-lg font-bold text-text-primary mb-4">
            クイックアクション
          </h2>
          <div className="space-y-2">
            <Link
              href="/dashboard/services/new"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-bg-secondary transition-colors"
            >
              <CalendarDays size={18} className="text-info" />
              <span className="text-sm text-text-primary">
                レッスンを作成
              </span>
            </Link>
            <Link
              href="/dashboard/recipes/new"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-bg-secondary transition-colors"
            >
              <UtensilsCrossed size={18} className="text-success" />
              <span className="text-sm text-text-primary">
                レシピを追加
              </span>
            </Link>
            <Link
              href="/dashboard/sales"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-bg-secondary transition-colors"
            >
              <BarChart3 size={18} className="text-accent" />
              <span className="text-sm text-text-primary">
                利益を確認
              </span>
            </Link>
            <Link
              href="/dashboard/customers/messages"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-bg-secondary transition-colors"
            >
              <Send size={18} className="text-purple-500" />
              <span className="text-sm text-text-primary">
                メッセージを送信
              </span>
            </Link>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-border-light p-6">
          <h2 className="text-lg font-bold text-text-primary mb-4">
            最近のアクティビティ
          </h2>
          <div className="space-y-3">
            {bookings.slice(0, 3).map((b) => (
              <div
                key={b.id}
                className="flex items-start gap-3 py-2 border-b border-border-light last:border-b-0"
              >
                <div className="w-8 h-8 rounded-full bg-info/10 flex items-center justify-center shrink-0 mt-0.5">
                  <CalendarDays size={14} className="text-info" />
                </div>
                <div>
                  <p className="text-sm text-text-primary">
                    <span className="font-medium">{b.customerName}</span>が
                    <span className="font-medium">{b.serviceName}</span>
                    を予約しました
                  </p>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {b.createdAt}
                  </p>
                </div>
              </div>
            ))}
            {reviews.slice(0, 2).map((r) => (
              <div
                key={r.id}
                className="flex items-start gap-3 py-2 border-b border-border-light last:border-b-0"
              >
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Star size={14} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm text-text-primary">
                    <span className="font-medium">{r.customerName}</span>が
                    <span className="font-medium">{r.serviceName}</span>
                    にレビューを投稿しました
                  </p>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={
                          i < r.rating
                            ? "text-accent fill-accent"
                            : "text-border"
                        }
                      />
                    ))}
                  </div>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {r.createdAt}
                  </p>
                </div>
              </div>
            ))}
            {sales.slice(0, 2).map((s) => (
              <div
                key={s.id}
                className="flex items-start gap-3 py-2 border-b border-border-light last:border-b-0"
              >
                <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                  <CreditCard size={14} className="text-success" />
                </div>
                <div>
                  <p className="text-sm text-text-primary">
                    <span className="font-medium">{s.customerName}</span>が
                    {"\u00a5"}
                    {s.amount.toLocaleString()}を決済しました
                  </p>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {s.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

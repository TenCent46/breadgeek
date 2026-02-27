"use client";

import { useMemo } from "react";
import {
  BarChart3,
  Users,
  Repeat,
  Heart,
  Trophy,
  Star,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import type { Booking, Customer, Service, KitchenSettings } from "@/lib/types";

function formatCurrency(amount: number) {
  return `\u00a5${Math.round(amount).toLocaleString()}`;
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function utilizationColor(pct: number): string {
  if (pct >= 80) return "text-success";
  if (pct >= 50) return "text-warning";
  return "text-error";
}

function utilizationBgColor(pct: number): string {
  if (pct >= 80) return "bg-success";
  if (pct >= 50) return "bg-warning";
  return "bg-error";
}

interface AnalyticsClientProps {
  bookings: Booking[];
  customers: Customer[];
  services: Service[];
  settings: KitchenSettings;
}

export function AnalyticsClient({ bookings, customers, services, settings }: AnalyticsClientProps) {
  const publishedServices = useMemo(
    () => services.filter((s) => s.status === "published"),
    [services]
  );

  // --- Utilization Table ---
  const utilizationData = useMemo(() => {
    return publishedServices.map((svc) => {
      const capacity = svc.capacity ?? settings.maxCapacity;
      const serviceBookings = bookings.filter(
        (b) => b.serviceId === svc.id && (b.status === "completed" || b.status === "confirmed")
      );
      // Group by date to count sessions
      const sessionDates = new Set(serviceBookings.map((b) => b.date));
      const sessionCount = sessionDates.size || 1;
      const totalAttendees = serviceBookings.length;
      const avgAttendees = totalAttendees / sessionCount;
      const utilizationPct = capacity > 0 ? (avgAttendees / capacity) * 100 : 0;

      const totalRevenue = serviceBookings.reduce((sum, b) => sum + b.amount, 0);
      const perSeatRevenue = totalAttendees > 0 ? totalRevenue / totalAttendees : 0;

      return {
        id: svc.id,
        name: svc.title,
        capacity,
        avgAttendees: Math.round(avgAttendees * 10) / 10,
        utilizationPct: Math.round(utilizationPct * 10) / 10,
        totalRevenue,
        perSeatRevenue: Math.round(perSeatRevenue),
        bookingsCount: totalAttendees,
      };
    });
  }, [publishedServices, bookings, settings]);

  // Average utilization
  const avgUtilization = useMemo(() => {
    if (utilizationData.length === 0) return 0;
    return (
      utilizationData.reduce((sum, u) => sum + u.utilizationPct, 0) /
      utilizationData.length
    );
  }, [utilizationData]);

  // --- Repeat Rate ---
  const repeatRates = useMemo(() => {
    if (customers.length === 0) return { rate30: 0, rate60: 0, rate90: 0 };

    // Use customer repeatRate field for 30-day; approximate 60 and 90
    const customersWithBookings = customers.filter((c) => c.visitCount > 0);
    const total = customersWithBookings.length || 1;

    const repeat30 =
      customersWithBookings.filter((c) => c.repeatRate > 0).length;
    const repeat60 =
      customersWithBookings.filter((c) => c.visitCount >= 2).length;
    const repeat90 =
      customersWithBookings.filter((c) => c.visitCount >= 3).length;

    return {
      rate30: (repeat30 / total) * 100,
      rate60: (repeat60 / total) * 100,
      rate90: (repeat90 / total) * 100,
    };
  }, [customers]);

  // --- Tier Breakdown ---
  const tierBreakdown = useMemo(() => {
    const tiers: { key: string; label: string; color: string }[] = [
      { key: "repeater", label: "リピーター", color: "bg-accent" },
      { key: "regular", label: "レギュラー", color: "bg-info" },
      { key: "trial", label: "体験生", color: "bg-purple-500" },
      { key: "dormant", label: "休眠", color: "bg-text-tertiary" },
    ];

    const total = customers.length || 1;
    return tiers.map((t) => {
      const count = customers.filter((c) => c.tier === t.key).length;
      return {
        ...t,
        count,
        pct: (count / total) * 100,
      };
    });
  }, [customers]);

  // --- Student LTV (Top 5) ---
  const topStudentsByLTV = useMemo(() => {
    return [...customers]
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);
  }, [customers]);

  // --- Average LTV ---
  const avgLTV = useMemo(() => {
    if (customers.length === 0) return 0;
    return customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length;
  }, [customers]);

  // --- Popularity Ranking ---
  const popularityRanking = useMemo(() => {
    return utilizationData
      .map((u) => ({
        name: u.name,
        bookingsCount: u.bookingsCount,
        revenue: u.totalRevenue,
      }))
      .sort((a, b) => b.bookingsCount - a.bookingsCount);
  }, [utilizationData]);

  // Most popular lesson name
  const mostPopularLesson =
    popularityRanking.length > 0 ? popularityRanking[0].name : "-";

  // Max values for bar sizing
  const maxTierCount = useMemo(
    () => Math.max(...tierBreakdown.map((t) => t.count), 1),
    [tierBreakdown]
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          稼働率・リピート分析
        </h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          label="平均稼働率"
          value={formatPercent(avgUtilization)}
          icon={BarChart3}
          iconColor={utilizationColor(avgUtilization)}
        />
        <StatCard
          label="リピート率 (30日)"
          value={formatPercent(repeatRates.rate30)}
          icon={Repeat}
          iconColor="text-accent"
        />
        <StatCard
          label="生徒LTV"
          value={formatCurrency(avgLTV)}
          icon={Heart}
          iconColor="text-pink-500"
        />
        <StatCard
          label="人気No.1レッスン"
          value={mostPopularLesson}
          icon={Trophy}
          iconColor="text-warning"
        />
      </div>

      {/* Utilization Table */}
      <div className="bg-white rounded-xl border border-border-light overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-border-light">
          <h2 className="text-lg font-bold text-text-primary">
            レッスン別稼働率
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-light">
                <th className="text-left px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  レッスン名
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  定員
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  平均参加数
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  稼働率
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  1席あたり売上
                </th>
              </tr>
            </thead>
            <tbody>
              {utilizationData.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <BarChart3 size={40} className="text-border mb-3" />
                      <p className="text-sm text-text-tertiary">
                        データがありません
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                utilizationData.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border-light last:border-b-0 hover:bg-bg-secondary/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-text-primary">
                      {row.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary text-right">
                      {row.capacity}名
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary text-right">
                      {row.avgAttendees}名
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${utilizationBgColor(row.utilizationPct)}`}
                            style={{
                              width: `${Math.min(row.utilizationPct, 100)}%`,
                            }}
                          />
                        </div>
                        <span
                          className={`text-sm font-bold ${utilizationColor(row.utilizationPct)}`}
                        >
                          {formatPercent(row.utilizationPct)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-text-primary text-right">
                      {formatCurrency(row.perSeatRevenue)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Repeat Rate Bars */}
        <div className="bg-white rounded-xl border border-border-light p-6">
          <h2 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
            <Repeat size={20} className="text-accent" />
            リピート率推移
          </h2>

          <div className="space-y-5">
            {[
              { label: "30日リピート率", value: repeatRates.rate30, color: "bg-accent" },
              { label: "60日リピート率", value: repeatRates.rate60, color: "bg-info" },
              { label: "90日リピート率", value: repeatRates.rate90, color: "bg-success" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-secondary">{item.label}</span>
                  <span className="text-sm font-bold text-text-primary">
                    {formatPercent(item.value)}
                  </span>
                </div>
                <div className="h-6 bg-bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all flex items-center justify-end pr-2`}
                    style={{ width: `${Math.max(item.value, 3)}%` }}
                  >
                    {item.value > 20 && (
                      <span className="text-xs font-medium text-white">
                        {formatPercent(item.value)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier Breakdown */}
        <div className="bg-white rounded-xl border border-border-light p-6">
          <h2 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
            <Users size={20} className="text-info" />
            ティア別内訳
          </h2>

          <div className="space-y-4">
            {tierBreakdown.map((tier) => (
              <div key={tier.key} className="flex items-center gap-4">
                <div className="w-24 shrink-0">
                  <Badge status={tier.key} />
                </div>
                <div className="flex-1 h-8 bg-bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full ${tier.color} rounded-full transition-all flex items-center justify-end pr-3`}
                    style={{
                      width: `${Math.max((tier.count / maxTierCount) * 100, 8)}%`,
                    }}
                  >
                    {tier.count > 0 && (
                      <span className="text-xs font-medium text-white">
                        {tier.count}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-sm text-text-tertiary w-16 text-right">
                  {tier.count}名
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border-light">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">合計</span>
              <span className="font-bold text-text-primary">
                {customers.length}名
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popularity Ranking */}
        <div className="bg-white rounded-xl border border-border-light p-6">
          <h2 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
            <Star size={20} className="text-warning" />
            レッスン人気ランキング
          </h2>

          {popularityRanking.length === 0 ? (
            <p className="text-sm text-text-tertiary text-center py-8">
              データがありません
            </p>
          ) : (
            <div className="space-y-3">
              {popularityRanking.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-bg-secondary/50 transition-colors"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      index === 0
                        ? "bg-warning/20 text-warning"
                        : index === 1
                        ? "bg-text-tertiary/15 text-text-tertiary"
                        : index === 2
                        ? "bg-orange-100 text-orange-600"
                        : "bg-bg-secondary text-text-tertiary"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {item.bookingsCount}件の予約
                    </p>
                  </div>
                  <span className="text-sm font-bold text-text-primary shrink-0">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top 5 Students by LTV */}
        <div className="bg-white rounded-xl border border-border-light overflow-hidden">
          <div className="px-6 py-4 border-b border-border-light">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <TrendingUp size={20} className="text-success" />
              LTV上位5名
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-light">
                  <th className="text-left px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    順位
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    生徒名
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    ティア
                  </th>
                  <th className="text-right px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    来店数
                  </th>
                  <th className="text-right px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    LTV
                  </th>
                </tr>
              </thead>
              <tbody>
                {topStudentsByLTV.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Users size={40} className="text-border mb-3" />
                        <p className="text-sm text-text-tertiary">
                          データがありません
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  topStudentsByLTV.map((student, index) => (
                    <tr
                      key={student.id}
                      className="border-b border-border-light last:border-b-0 hover:bg-bg-secondary/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0
                              ? "bg-warning/20 text-warning"
                              : index === 1
                              ? "bg-text-tertiary/15 text-text-tertiary"
                              : index === 2
                              ? "bg-orange-100 text-orange-600"
                              : "bg-bg-secondary text-text-tertiary"
                          }`}
                        >
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-text-primary">
                        {student.name}
                      </td>
                      <td className="px-6 py-4">
                        <Badge status={student.tier} />
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary text-right">
                        {student.visitCount}回
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-success text-right">
                        {formatCurrency(student.totalSpent)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Wallet,
  ShoppingBasket,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import type { SaleRecord, MonthlySales, MonthlyProfit } from "@/lib/types";

const paymentMethodLabels: Record<string, string> = {
  credit_card: "クレジットカード",
  bank_transfer: "銀行振込",
  convenience_store: "コンビニ決済",
};

interface SalesClientProps {
  sales: SaleRecord[];
  monthlySales: MonthlySales[];
  monthlyProfit: MonthlyProfit[];
}

export function SalesClient({ sales, monthlySales, monthlyProfit }: SalesClientProps) {
  // Filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Current month sales (February 2026)
  const currentMonthSales = useMemo(
    () => sales.filter((s) => s.date.startsWith("2026-02")),
    [sales]
  );

  const thisMonthRevenue = useMemo(
    () =>
      currentMonthSales
        .filter((s) => s.status === "completed")
        .reduce((acc, s) => acc + s.amount, 0),
    [currentMonthSales]
  );

  // Previous month revenue (January 2026)
  const lastMonthRevenue = useMemo(() => {
    const lastMonth = sales
      .filter((s) => s.date.startsWith("2026-01") && s.status === "completed")
      .reduce((acc, s) => acc + s.amount, 0);
    return lastMonth;
  }, [sales]);

  const revenueChangePercent = useMemo(() => {
    if (lastMonthRevenue === 0) return 0;
    return Math.round(
      ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    );
  }, [thisMonthRevenue, lastMonthRevenue]);

  // Net amount (payout estimate)
  const netAmountTotal = useMemo(
    () =>
      currentMonthSales
        .filter((s) => s.status === "completed")
        .reduce((acc, s) => acc + s.netAmount, 0),
    [currentMonthSales]
  );

  // Current month profit from monthlyProfit
  const currentMonthProfitData = useMemo(() => {
    return monthlyProfit.find((mp) => mp.month === "2026-02");
  }, [monthlyProfit]);

  const thisMonthProfit = currentMonthProfitData?.profit ?? 0;

  // All-time revenue
  const allTimeRevenue = useMemo(
    () =>
      sales
        .filter((s) => s.status === "completed")
        .reduce((acc, s) => acc + s.amount, 0),
    [sales]
  );

  // This month transaction count
  const thisMonthTransactions = useMemo(
    () => currentMonthSales.length,
    [currentMonthSales]
  );

  // Payment method breakdown
  const paymentBreakdown = useMemo(() => {
    const completed = sales.filter((s) => s.status === "completed");
    const total = completed.length || 1;
    const creditCard = completed.filter(
      (s) => s.paymentMethod === "credit_card"
    ).length;
    const bankTransfer = completed.filter(
      (s) => s.paymentMethod === "bank_transfer"
    ).length;
    const convenienceStore = completed.filter(
      (s) => s.paymentMethod === "convenience_store"
    ).length;
    return [
      {
        label: "クレジットカード",
        count: creditCard,
        pct: Math.round((creditCard / total) * 100),
        color: "bg-blue-500",
      },
      {
        label: "銀行振込",
        count: bankTransfer,
        pct: Math.round((bankTransfer / total) * 100),
        color: "bg-green-500",
      },
      {
        label: "コンビニ決済",
        count: convenienceStore,
        pct: Math.round((convenienceStore / total) * 100),
        color: "bg-orange-500",
      },
    ];
  }, [sales]);

  // Service names for filter
  const serviceNames = useMemo(() => {
    const names = new Set(sales.map((s) => s.serviceName));
    return Array.from(names);
  }, [sales]);

  // Filtered sales for table
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      if (dateFrom && s.date < dateFrom) return false;
      if (dateTo && s.date > dateTo) return false;
      if (serviceFilter !== "all" && s.serviceName !== serviceFilter)
        return false;
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      return true;
    });
  }, [sales, dateFrom, dateTo, serviceFilter, statusFilter]);

  // Monthly chart
  const maxRevenue = useMemo(
    () => Math.max(...monthlySales.map((m) => m.revenue), 1),
    [monthlySales]
  );

  // Monthly profit chart max
  const maxProfitChartValue = useMemo(
    () => Math.max(...monthlyProfit.map((m) => m.revenue), 1),
    [monthlyProfit]
  );

  const formatCurrency = (amount: number) => {
    return `\u00a5${amount.toLocaleString()}`;
  };

  const formatMonth = (month: string) => {
    const [, m] = month.split("-");
    return `${parseInt(m)}月`;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">売上管理</h1>
        <button className="flex items-center gap-2 border border-border rounded-lg px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-secondary transition-colors">
          <Download size={16} />
          CSVエクスポート
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
        {/* This Month Revenue */}
        <div className="bg-white rounded-xl border border-border-light p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-text-secondary">今月の売上</span>
            <TrendingUp size={20} className="text-success" />
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {formatCurrency(thisMonthRevenue)}
          </p>
          <p className="text-xs mt-1 flex items-center gap-1">
            {revenueChangePercent >= 0 ? (
              <>
                <ArrowUpRight size={12} className="text-success" />
                <span className="text-success font-medium">
                  前月比 +{revenueChangePercent}%
                </span>
              </>
            ) : (
              <>
                <ArrowDownRight size={12} className="text-error" />
                <span className="text-error font-medium">
                  前月比 {revenueChangePercent}%
                </span>
              </>
            )}
          </p>
        </div>

        {/* This Month Profit */}
        <div className="bg-white rounded-xl border border-border-light p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-text-secondary">今月利益</span>
            <ShoppingBasket size={20} className="text-accent" />
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {formatCurrency(thisMonthProfit)}
          </p>
          {currentMonthProfitData && (
            <p className="text-xs text-text-tertiary mt-1">
              材料費: {formatCurrency(currentMonthProfitData.ingredientCost)}
            </p>
          )}
        </div>

        {/* Payout Estimate */}
        <div className="bg-white rounded-xl border border-border-light p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-text-secondary">出金予定額</span>
            <Wallet size={20} className="text-info" />
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {formatCurrency(netAmountTotal)}
          </p>
          <p className="text-xs text-text-tertiary mt-1">
            次回出金日: 毎月25日
          </p>
        </div>

        <StatCard
          label="累計売上"
          value={formatCurrency(allTimeRevenue)}
          icon={DollarSign}
          iconColor="text-purple-500"
        />

        <StatCard
          label="取引件数"
          value={`${thisMonthTransactions}件`}
          change="今月"
          icon={CreditCard}
          iconColor="text-accent"
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-border-light p-6 mb-6">
        <h2 className="text-lg font-bold text-text-primary mb-6">
          月次売上推移
        </h2>
        <div className="flex items-end justify-between gap-4" style={{ height: 260 }}>
          {monthlySales.map((ms) => {
            const barHeight = (ms.revenue / maxRevenue) * 200;
            return (
              <div
                key={ms.month}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <span className="text-xs font-medium text-text-secondary">
                  {formatCurrency(ms.revenue)}
                </span>
                <div
                  className="w-full max-w-16 bg-accent rounded-t-lg transition-all"
                  style={{ height: barHeight }}
                />
                <span className="text-xs text-text-tertiary">
                  {formatMonth(ms.month)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Profit Chart */}
      <div className="bg-white rounded-xl border border-border-light p-6 mb-6">
        <h2 className="text-lg font-bold text-text-primary mb-2">
          月次利益推移
        </h2>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <div className="w-3 h-3 rounded bg-accent/40" />
            <span>売上</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <div className="w-3 h-3 rounded bg-accent" />
            <span>利益</span>
          </div>
        </div>
        <div className="flex items-end justify-between gap-4" style={{ height: 260 }}>
          {monthlyProfit.map((mp) => {
            const revenueBarHeight = (mp.revenue / maxProfitChartValue) * 200;
            const profitBarHeight = (mp.profit / maxProfitChartValue) * 200;
            return (
              <div
                key={mp.month}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <span className="text-xs font-medium text-text-secondary">
                  {formatCurrency(mp.profit)}
                </span>
                <div className="w-full max-w-16 relative" style={{ height: revenueBarHeight }}>
                  {/* Revenue bar (lighter) */}
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-accent/30 rounded-t-lg"
                    style={{ height: revenueBarHeight }}
                  />
                  {/* Profit bar (darker, overlaid) */}
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-accent rounded-t-lg"
                    style={{ height: Math.max(profitBarHeight, 0) }}
                  />
                </div>
                <span className="text-xs text-text-tertiary">
                  {formatMonth(mp.month)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Method Breakdown */}
      <div className="bg-white rounded-xl border border-border-light p-6 mb-6">
        <h2 className="text-lg font-bold text-text-primary mb-4">
          決済方法内訳
        </h2>
        <div className="space-y-4">
          {paymentBreakdown.map((pm) => (
            <div key={pm.label} className="flex items-center gap-4">
              <span className="text-sm text-text-secondary w-36 shrink-0">
                {pm.label}
              </span>
              <div className="flex-1 h-8 bg-bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full ${pm.color} rounded-full transition-all flex items-center justify-end pr-3`}
                  style={{ width: `${Math.max(pm.pct, 5)}%` }}
                >
                  {pm.pct > 15 && (
                    <span className="text-xs font-medium text-white">
                      {pm.pct}%
                    </span>
                  )}
                </div>
              </div>
              {pm.pct <= 15 && (
                <span className="text-xs font-medium text-text-tertiary">
                  {pm.pct}%
                </span>
              )}
              <span className="text-sm text-text-tertiary w-12 text-right">
                {pm.count}件
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sales History Table */}
      <div className="bg-white rounded-xl border border-border-light overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-border-light">
          <h2 className="text-lg font-bold text-text-primary">売上履歴</h2>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-border-light">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs text-text-tertiary">開始日</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-text-tertiary">終了日</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="border border-border rounded-lg px-3 py-2.5 text-sm text-text-secondary focus:border-primary focus:outline-none"
            >
              <option value="all">すべてのレッスン</option>
              {serviceNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-border rounded-lg px-3 py-2.5 text-sm text-text-secondary focus:border-primary focus:outline-none"
            >
              <option value="all">すべてのステータス</option>
              <option value="completed">完了</option>
              <option value="refunded">返金済み</option>
              <option value="pending">保留</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-light">
                <th className="text-left px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  日付
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  レッスン名
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  生徒名
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  売上
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  材料費
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  利益
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  手数料
                </th>
                <th className="text-center px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  ステータス
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <DollarSign size={40} className="text-border mb-3" />
                      <p className="text-sm text-text-tertiary">
                        条件に一致する売上データはありません
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="border-b border-border-light last:border-b-0 hover:bg-bg-secondary/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-text-primary">
                      {sale.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary">
                      {sale.serviceName}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary">
                      {sale.customerName}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm text-right font-medium ${
                        sale.status === "refunded"
                          ? "text-error"
                          : "text-text-primary"
                      }`}
                    >
                      {formatCurrency(sale.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-text-secondary">
                      {formatCurrency(sale.ingredientCost)}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm text-right font-medium ${
                        sale.profit > 0 ? "text-success" : "text-error"
                      }`}
                    >
                      {formatCurrency(sale.profit)}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm text-right ${
                        sale.status === "refunded"
                          ? "text-error"
                          : "text-text-tertiary"
                      }`}
                    >
                      {formatCurrency(sale.fee)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge status={sale.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-white rounded-xl border border-border-light overflow-hidden">
        <div className="px-6 py-4 border-b border-border-light">
          <h2 className="text-lg font-bold text-text-primary">出金履歴</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-light">
                <th className="text-left px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  出金日
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  金額
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  口座
                </th>
                <th className="text-center px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  ステータス
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border-light hover:bg-bg-secondary/50 transition-colors">
                <td className="px-6 py-4 text-sm text-text-primary">
                  2026-01-25
                </td>
                <td className="px-6 py-4 text-sm text-right font-medium text-text-primary">
                  {formatCurrency(42560)}
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">
                  三井住友銀行 ***1234
                </td>
                <td className="px-6 py-4 text-center">
                  <Badge status="completed" />
                </td>
              </tr>
              <tr className="border-b border-border-light hover:bg-bg-secondary/50 transition-colors">
                <td className="px-6 py-4 text-sm text-text-primary">
                  2025-12-25
                </td>
                <td className="px-6 py-4 text-sm text-right font-medium text-text-primary">
                  {formatCurrency(38200)}
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">
                  三井住友銀行 ***1234
                </td>
                <td className="px-6 py-4 text-center">
                  <Badge status="completed" />
                </td>
              </tr>
              <tr className="border-b border-border-light hover:bg-bg-secondary/50 transition-colors">
                <td className="px-6 py-4 text-sm text-text-primary">
                  2025-11-25
                </td>
                <td className="px-6 py-4 text-sm text-right font-medium text-text-primary">
                  {formatCurrency(31500)}
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">
                  三井住友銀行 ***1234
                </td>
                <td className="px-6 py-4 text-center">
                  <Badge status="completed" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Next payout callout */}
        <div className="px-6 py-4 border-t border-border-light bg-accent/5">
          <div className="flex items-center gap-3">
            <Calendar size={18} className="text-accent" />
            <div>
              <p className="text-sm font-medium text-text-primary">
                次回出金予定日: 2026年2月25日
              </p>
              <p className="text-xs text-text-tertiary">
                出金予定額: {formatCurrency(netAmountTotal)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

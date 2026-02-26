"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Calculator,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";

function formatCurrency(amount: number) {
  return `\u00a5${Math.round(amount).toLocaleString()}`;
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export default function ProfitPage() {
  const {
    services,
    recipes,
    bookings,
    monthlyProfit,
    kitchenSettings,
    sales,
  } = useDashboard();

  // Published services for simulation
  const publishedServices = useMemo(
    () => services.filter((s) => s.status === "published"),
    [services]
  );

  // Current month stats (February 2026)
  const currentMonthData = useMemo(
    () => monthlyProfit.find((m) => m.month === "2026-02"),
    [monthlyProfit]
  );

  const currentMonthProfit = currentMonthData?.profit ?? 0;
  const currentMonthRevenue = currentMonthData?.revenue ?? 0;
  const currentMonthProfitMargin =
    currentMonthRevenue > 0
      ? (currentMonthProfit / currentMonthRevenue) * 100
      : 0;

  // Per-seat revenue
  const completedBookingsThisMonth = useMemo(
    () =>
      bookings.filter(
        (b) => b.date.startsWith("2026-02") && b.status === "completed"
      ),
    [bookings]
  );

  const totalAttendeesThisMonth = completedBookingsThisMonth.length;
  const perSeatRevenue =
    totalAttendeesThisMonth > 0
      ? currentMonthRevenue / totalAttendeesThisMonth
      : 0;

  // Monthly lessons count
  const monthlyLessonsCount = useMemo(() => {
    const uniqueDates = new Set(
      bookings
        .filter((b) => b.date.startsWith("2026-02"))
        .map((b) => `${b.serviceId}-${b.date}`)
    );
    return uniqueDates.size || publishedServices.length;
  }, [bookings, publishedServices]);

  // --- Lesson Simulator ---
  const [selectedServiceId, setSelectedServiceId] = useState("");

  const selectedService = useMemo(
    () => publishedServices.find((s) => s.id === selectedServiceId),
    [publishedServices, selectedServiceId]
  );

  const linkedRecipe = useMemo(() => {
    if (!selectedService?.linkedRecipeId) return null;
    return recipes.find((r) => r.id === selectedService.linkedRecipeId) ?? null;
  }, [selectedService, recipes]);

  const autoPrice = selectedService?.price ?? 0;
  const autoCapacity = selectedService?.capacity ?? kitchenSettings.maxCapacity;
  const autoIngredientCost = linkedRecipe?.costPerServing ?? 0;

  const [simAttendees, setSimAttendees] = useState(1);
  const [simPrice, setSimPrice] = useState(0);
  const [simIngredientCost, setSimIngredientCost] = useState(0);
  const [simOverhead, setSimOverhead] = useState(kitchenSettings.defaultOverheadPerLesson);

  // Auto-fill when service changes
  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const svc = publishedServices.find((s) => s.id === serviceId);
    if (svc) {
      setSimPrice(svc.price);
      setSimAttendees(Math.min(svc.capacity ?? kitchenSettings.maxCapacity, 1));
      const recipe = svc.linkedRecipeId
        ? recipes.find((r) => r.id === svc.linkedRecipeId)
        : null;
      setSimIngredientCost(recipe?.costPerServing ?? 0);
    }
    setSimOverhead(kitchenSettings.defaultOverheadPerLesson);
  };

  // Simulation calculations
  const simRevenue = simPrice * simAttendees;
  const simTotalIngredient = simIngredientCost * simAttendees;
  const simFee = Math.round(simRevenue * (kitchenSettings.platformFeePercent / 100));
  const simTotalCost = simTotalIngredient + simFee + simOverhead;
  const simProfit = simRevenue - simTotalCost;
  const simProfitMargin = simRevenue > 0 ? (simProfit / simRevenue) * 100 : 0;

  // Break-even attendees
  const costPerPersonExFee = simIngredientCost;
  const revenuePerPersonAfterFee =
    simPrice * (1 - kitchenSettings.platformFeePercent / 100);
  const marginPerPerson = revenuePerPersonAfterFee - costPerPersonExFee;
  const breakEvenAttendees =
    marginPerPerson > 0 ? Math.ceil(simOverhead / marginPerPerson) : 0;

  // Monthly profit bar chart
  const maxChartValue = useMemo(
    () => Math.max(...monthlyProfit.map((m) => Math.max(m.revenue, Math.abs(m.profit))), 1),
    [monthlyProfit]
  );

  const formatMonth = (month: string) => {
    const [, m] = month.split("-");
    return `${parseInt(m)}月`;
  };

  // Break-even table for all published services
  const breakEvenTable = useMemo(() => {
    return publishedServices.map((svc) => {
      const recipe = svc.linkedRecipeId
        ? recipes.find((r) => r.id === svc.linkedRecipeId)
        : null;
      const costPerPerson = recipe?.costPerServing ?? 0;
      const revenueAfterFee =
        svc.price * (1 - kitchenSettings.platformFeePercent / 100);
      const margin = revenueAfterFee - costPerPerson;
      const be =
        margin > 0
          ? Math.ceil(kitchenSettings.defaultOverheadPerLesson / margin)
          : 0;
      const cap = svc.capacity ?? kitchenSettings.maxCapacity;
      const feasible = be > 0 && be <= cap;

      return {
        id: svc.id,
        name: svc.title,
        price: svc.price,
        costPerPerson,
        breakEven: be,
        capacity: cap,
        feasible,
      };
    });
  }, [publishedServices, recipes, kitchenSettings]);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          利益シミュレーション
        </h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          label="今月利益"
          value={formatCurrency(currentMonthProfit)}
          icon={DollarSign}
          iconColor={currentMonthProfit >= 0 ? "text-success" : "text-error"}
        />
        <StatCard
          label="利益率"
          value={formatPercent(currentMonthProfitMargin)}
          icon={TrendingUp}
          iconColor="text-accent"
        />
        <StatCard
          label="1席あたり売上"
          value={formatCurrency(perSeatRevenue)}
          icon={Users}
          iconColor="text-info"
        />
        <StatCard
          label="月間レッスン数"
          value={`${monthlyLessonsCount}回`}
          icon={Calendar}
          iconColor="text-purple-500"
        />
      </div>

      {/* Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Input side */}
        <div className="bg-white rounded-xl border border-border-light p-6">
          <h2 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
            <Calculator size={20} className="text-accent" />
            レッスン別シミュレーション
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                レッスンを選択
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              >
                <option value="">レッスンを選択してください</option>
                {publishedServices.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({formatCurrency(s.price)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                参加人数: {simAttendees}名
              </label>
              <input
                type="range"
                min={1}
                max={autoCapacity}
                value={simAttendees}
                onChange={(e) => setSimAttendees(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-text-tertiary mt-1">
                <span>1名</span>
                <span>{autoCapacity}名 (定員)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                レッスン価格 (¥)
              </label>
              <input
                type="number"
                value={simPrice}
                onChange={(e) => setSimPrice(Math.max(0, parseInt(e.target.value) || 0))}
                min={0}
                className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                材料費/人 (¥)
              </label>
              <input
                type="number"
                value={simIngredientCost}
                onChange={(e) => setSimIngredientCost(Math.max(0, parseInt(e.target.value) || 0))}
                min={0}
                className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                諸経費 (¥)
              </label>
              <input
                type="number"
                value={simOverhead}
                onChange={(e) => setSimOverhead(Math.max(0, parseInt(e.target.value) || 0))}
                min={0}
                className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
              <p className="text-xs text-text-tertiary mt-1">
                光熱費、場所代など1回あたりの固定費
              </p>
            </div>
          </div>
        </div>

        {/* Result side */}
        <div className="bg-white rounded-xl border border-border-light p-6">
          <h2 className="text-lg font-bold text-text-primary mb-6">
            シミュレーション結果
          </h2>

          <div className="space-y-4">
            {/* Revenue */}
            <div className="flex items-center justify-between py-3 border-b border-border-light">
              <span className="text-sm text-text-secondary">売上</span>
              <span className="text-sm font-medium text-text-primary">
                {formatCurrency(simRevenue)}
              </span>
            </div>

            {/* Ingredient cost */}
            <div className="flex items-center justify-between py-3 border-b border-border-light">
              <span className="text-sm text-text-secondary">材料費</span>
              <span className="text-sm text-error">
                -{formatCurrency(simTotalIngredient)}
              </span>
            </div>

            {/* Platform fee */}
            <div className="flex items-center justify-between py-3 border-b border-border-light">
              <span className="text-sm text-text-secondary">
                手数料 ({kitchenSettings.platformFeePercent}%)
              </span>
              <span className="text-sm text-error">
                -{formatCurrency(simFee)}
              </span>
            </div>

            {/* Overhead */}
            <div className="flex items-center justify-between py-3 border-b border-border-light">
              <span className="text-sm text-text-secondary">諸経費</span>
              <span className="text-sm text-error">
                -{formatCurrency(simOverhead)}
              </span>
            </div>

            {/* Profit */}
            <div className="flex items-center justify-between py-4 bg-bg-secondary rounded-lg px-4 mt-2">
              <span className="text-base font-bold text-text-primary">利益</span>
              <span
                className={`text-xl font-bold ${
                  simProfit >= 0 ? "text-success" : "text-error"
                }`}
              >
                {formatCurrency(simProfit)}
              </span>
            </div>

            {/* Profit Margin */}
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-text-secondary">利益率</span>
              <span
                className={`text-sm font-bold ${
                  simProfitMargin >= 0 ? "text-success" : "text-error"
                }`}
              >
                {formatPercent(simProfitMargin)}
              </span>
            </div>

            {/* Break-even */}
            <div className="flex items-center justify-between py-3 border-t border-border-light">
              <span className="text-sm text-text-secondary">損益分岐点人数</span>
              <span className="text-sm font-bold text-accent">
                {breakEvenAttendees > 0 ? `${breakEvenAttendees}名` : "-"}
              </span>
            </div>

            {/* Visual indicator */}
            {selectedServiceId && breakEvenAttendees > 0 && (
              <div
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  simAttendees >= breakEvenAttendees
                    ? "bg-success/10"
                    : "bg-error/10"
                }`}
              >
                {simAttendees >= breakEvenAttendees ? (
                  <>
                    <CheckCircle size={16} className="text-success" />
                    <span className="text-sm text-success font-medium">
                      損益分岐点をクリアしています
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} className="text-error" />
                    <span className="text-sm text-error font-medium">
                      あと{breakEvenAttendees - simAttendees}名で損益分岐点に到達
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Profit Chart */}
      <div className="bg-white rounded-xl border border-border-light p-6 mb-6">
        <h2 className="text-lg font-bold text-text-primary mb-6">
          月次利益推移
        </h2>

        {/* Legend */}
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-accent" />
            <span className="text-xs text-text-secondary">売上</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-success" />
            <span className="text-xs text-text-secondary">利益</span>
          </div>
        </div>

        <div
          className="flex items-end justify-between gap-3"
          style={{ height: 280 }}
        >
          {monthlyProfit.map((mp) => {
            const revenueHeight = (mp.revenue / maxChartValue) * 220;
            const profitHeight = (Math.abs(mp.profit) / maxChartValue) * 220;
            const profitPositive = mp.profit >= 0;

            return (
              <div
                key={mp.month}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div className="text-center mb-1">
                  <span className="text-xs text-text-tertiary block">
                    {formatCurrency(mp.revenue)}
                  </span>
                  <span
                    className={`text-xs font-medium block ${
                      profitPositive ? "text-success" : "text-error"
                    }`}
                  >
                    {formatCurrency(mp.profit)}
                  </span>
                </div>
                <div className="flex items-end gap-1 w-full justify-center">
                  <div
                    className="w-5 bg-accent rounded-t-sm"
                    style={{ height: revenueHeight }}
                  />
                  <div
                    className={`w-5 rounded-t-sm ${
                      profitPositive ? "bg-success" : "bg-error"
                    }`}
                    style={{ height: profitHeight }}
                  />
                </div>
                <span className="text-xs text-text-tertiary mt-1">
                  {formatMonth(mp.month)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Break-even Table */}
      <div className="bg-white rounded-xl border border-border-light overflow-hidden">
        <div className="px-6 py-4 border-b border-border-light">
          <h2 className="text-lg font-bold text-text-primary">
            損益分岐点一覧
          </h2>
          <p className="text-xs text-text-tertiary mt-1">
            公開中の全サービスの損益分岐点 (諸経費: {formatCurrency(kitchenSettings.defaultOverheadPerLesson)}
            /回、手数料: {kitchenSettings.platformFeePercent}%)
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-light">
                <th className="text-left px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  レッスン名
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  価格
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  材料費/人
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  損益分岐
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  定員
                </th>
                <th className="text-center px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  ステータス
                </th>
              </tr>
            </thead>
            <tbody>
              {breakEvenTable.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Calculator size={40} className="text-border mb-3" />
                      <p className="text-sm text-text-tertiary">
                        公開中のサービスがありません
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                breakEvenTable.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border-light last:border-b-0 hover:bg-bg-secondary/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-text-primary">
                      {row.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary text-right">
                      {formatCurrency(row.price)}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary text-right">
                      {formatCurrency(row.costPerPerson)}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-accent text-right">
                      {row.breakEven > 0 ? `${row.breakEven}名` : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary text-right">
                      {row.capacity}名
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.feasible ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-success/10 text-success">
                          <CheckCircle size={12} />
                          達成可能
                        </span>
                      ) : row.breakEven > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-error/10 text-error">
                          <AlertCircle size={12} />
                          定員超過
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-bg-secondary text-text-tertiary">
                          算出不可
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

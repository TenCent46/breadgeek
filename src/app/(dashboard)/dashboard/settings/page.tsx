"use client";

import { useState, Fragment } from "react";
import {
  User, Building2, ChefHat, Landmark, CreditCard, FileText, Bell,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useDashboard } from "@/lib/dashboard-context";

const tabs = [
  { id: "account", label: "アカウント", icon: User },
  { id: "business", label: "事業者情報", icon: Building2 },
  { id: "kitchen", label: "教室設定", icon: ChefHat },
  { id: "bank", label: "口座情報", icon: Landmark },
  { id: "payment", label: "決済設定", icon: CreditCard },
  { id: "legal", label: "特定商取引法", icon: FileText },
  { id: "notifications", label: "通知設定", icon: Bell },
];

// ─── Notification types ───
interface NotificationRow {
  key: string;
  label: string;
}

interface NotificationCategory {
  category: string;
  items: NotificationRow[];
}

const notificationCategories: NotificationCategory[] = [
  {
    category: "予約関連",
    items: [
      { key: "booking_new", label: "新規予約" },
      { key: "booking_cancel", label: "キャンセル" },
      { key: "booking_remind", label: "リマインド" },
    ],
  },
  {
    category: "決済関連",
    items: [
      { key: "payment_complete", label: "決済完了" },
      { key: "payment_refund", label: "返金処理" },
    ],
  },
  {
    category: "レビュー",
    items: [{ key: "review_new", label: "新規レビュー" }],
  },
  {
    category: "メッセージ",
    items: [{ key: "message_new", label: "新規メッセージ" }],
  },
  {
    category: "システム",
    items: [
      { key: "system_maintenance", label: "メンテナンス通知" },
      { key: "system_security", label: "セキュリティ通知" },
    ],
  },
];

type NotificationChannel = "email" | "push" | "line";
type NotificationSettings = Record<string, Record<NotificationChannel, boolean>>;

function buildDefaultNotifications(): NotificationSettings {
  const settings: NotificationSettings = {};
  for (const cat of notificationCategories) {
    for (const item of cat.items) {
      settings[item.key] = { email: true, push: true, line: false };
    }
  }
  return settings;
}

export default function SettingsPage() {
  const { kitchenSettings, setKitchenSettings } = useDashboard();

  const [activeTab, setActiveTab] = useState("account");

  // ─── Account state ───
  const [accountName, setAccountName] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // ─── Business state ───
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("個人");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");

  // ─── Kitchen Settings state ───
  const [maxCapacity, setMaxCapacity] = useState(kitchenSettings.maxCapacity);
  const [defaultLessonDuration, setDefaultLessonDuration] = useState(kitchenSettings.defaultLessonDuration);
  const [ingredientReorderLeadDays, setIngredientReorderLeadDays] = useState(kitchenSettings.ingredientReorderLeadDays);
  const [defaultOverheadPerLesson, setDefaultOverheadPerLesson] = useState(kitchenSettings.defaultOverheadPerLesson);
  const [platformFeePercent, setPlatformFeePercent] = useState(kitchenSettings.platformFeePercent);

  // ─── Bank state ───
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [accountType, setAccountType] = useState<"savings" | "checking">("savings");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");

  // ─── Payment (Stripe) state ───
  const [stripeConnected, setStripeConnected] = useState(false);

  // ─── Legal state ───
  const [legalSellerName, setLegalSellerName] = useState("");
  const [legalAddress, setLegalAddress] = useState("");
  const [legalPhone, setLegalPhone] = useState("");
  const [legalEmail, setLegalEmail] = useState("");
  const [legalPrice, setLegalPrice] = useState("各レッスンページに記載");
  const [legalPaymentTiming, setLegalPaymentTiming] = useState("");
  const [legalDeliveryTiming, setLegalDeliveryTiming] = useState("");
  const [legalCancelPolicy, setLegalCancelPolicy] = useState("");
  const [legalNotes, setLegalNotes] = useState("");
  const [legalPreviewOpen, setLegalPreviewOpen] = useState(false);

  // ─── Notifications state ───
  const [notifications, setNotifications] = useState<NotificationSettings>(buildDefaultNotifications);

  const toggleNotification = (key: string, channel: NotificationChannel) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: { ...prev[key], [channel]: !prev[key][channel] },
    }));
  };

  const handleSaveKitchenSettings = () => {
    setKitchenSettings({
      maxCapacity,
      defaultLessonDuration,
      ingredientReorderLeadDays,
      defaultOverheadPerLesson,
      platformFeePercent,
    });
    alert("教室設定を保存しました");
  };

  const inputClass = "w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10";

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">設定</h1>

      <div className="flex gap-6">
        {/* Tabs sidebar */}
        <div className="w-48 shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                  activeTab === tab.id
                    ? "bg-bg-secondary font-medium text-text-primary"
                    : "text-text-secondary hover:bg-bg-secondary/60"
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* ━━━ Tab 1: アカウント ━━━ */}
          {activeTab === "account" && (
            <div className="bg-white rounded-xl border border-border-light p-6">
              <h2 className="text-lg font-bold text-text-primary mb-6">アカウント設定</h2>
              <div className="space-y-5 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">名前</label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className={inputClass}
                    placeholder="表示名を入力"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">メールアドレス</label>
                  <input
                    type="email"
                    value={accountEmail}
                    onChange={(e) => setAccountEmail(e.target.value)}
                    className={inputClass}
                    placeholder="mail@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">パスワード</label>
                  <button className="text-sm text-accent hover:underline">パスワードを変更する</button>
                </div>

                {/* 2段階認証 */}
                <div className="pt-4 border-t border-border-light">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-primary">2段階認証</p>
                      <p className="text-xs text-text-tertiary mt-0.5">
                        {twoFactorEnabled ? "2段階認証が有効です" : "セキュリティ強化のため、2段階認証を有効にすることをおすすめします"}
                      </p>
                    </div>
                    <Toggle checked={twoFactorEnabled} onChange={setTwoFactorEnabled} />
                  </div>
                </div>

                <button className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">
                  保存
                </button>
              </div>
            </div>
          )}

          {/* ━━━ Tab 2: 事業者情報 ━━━ */}
          {activeTab === "business" && (
            <div className="bg-white rounded-xl border border-border-light p-6">
              <h2 className="text-lg font-bold text-text-primary mb-6">事業者情報</h2>
              <div className="space-y-5 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">教室名 / 事業者名</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className={inputClass}
                    placeholder="例: BreadGeek パン教室"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">事業形態</label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  >
                    <option>個人</option>
                    <option>法人</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">住所</label>
                  <input
                    type="text"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">電話番号</label>
                  <input
                    type="tel"
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <button className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">
                  保存
                </button>
              </div>
            </div>
          )}

          {/* ━━━ Tab 3: 教室設定 (NEW) ━━━ */}
          {activeTab === "kitchen" && (
            <div className="bg-white rounded-xl border border-border-light p-6">
              <h2 className="text-lg font-bold text-text-primary mb-2">教室設定</h2>
              <p className="text-sm text-text-secondary mb-6">
                教室の基本設定を管理します。利益計算や在庫管理に使用されます。
              </p>
              <div className="space-y-5 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    最大収容人数
                  </label>
                  <input
                    type="number"
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(Math.max(1, parseInt(e.target.value) || 1))}
                    min={1}
                    className={inputClass}
                  />
                  <p className="text-xs text-text-tertiary mt-1">教室の物理的な最大収容人数</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    デフォルトレッスン時間（分）
                  </label>
                  <input
                    type="number"
                    value={defaultLessonDuration}
                    onChange={(e) => setDefaultLessonDuration(Math.max(30, parseInt(e.target.value) || 30))}
                    min={30}
                    step={15}
                    className={inputClass}
                  />
                  <p className="text-xs text-text-tertiary mt-1">新規レッスン作成時のデフォルト値</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    材料発注リードタイム（日）
                  </label>
                  <input
                    type="number"
                    value={ingredientReorderLeadDays}
                    onChange={(e) => setIngredientReorderLeadDays(Math.max(1, parseInt(e.target.value) || 1))}
                    min={1}
                    className={inputClass}
                  />
                  <p className="text-xs text-text-tertiary mt-1">在庫がしきい値を下回った際の発注猶予日数</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    デフォルト諸経費（1レッスンあたり）
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
                      ¥
                    </span>
                    <input
                      type="number"
                      value={defaultOverheadPerLesson}
                      onChange={(e) => setDefaultOverheadPerLesson(Math.max(0, parseInt(e.target.value) || 0))}
                      min={0}
                      className="w-full border border-border rounded-lg pl-8 pr-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                  <p className="text-xs text-text-tertiary mt-1">光熱費・消耗品など、1レッスンあたりの固定経費</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    プラットフォーム手数料（%）
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={platformFeePercent}
                      onChange={(e) => setPlatformFeePercent(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                      min={0}
                      max={100}
                      step={0.1}
                      className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 pr-8"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
                      %
                    </span>
                  </div>
                  <p className="text-xs text-text-tertiary mt-1">決済手数料の割合</p>
                </div>

                <button
                  onClick={handleSaveKitchenSettings}
                  className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
                >
                  保存する
                </button>
              </div>
            </div>
          )}

          {/* ━━━ Tab 4: 口座情報 ━━━ */}
          {activeTab === "bank" && (
            <div className="bg-white rounded-xl border border-border-light p-6">
              <h2 className="text-lg font-bold text-text-primary mb-6">口座情報</h2>
              <div className="space-y-5 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">銀行名</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className={inputClass}
                    placeholder="例: 三菱UFJ銀行"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">支店名</label>
                  <input
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    className={inputClass}
                    placeholder="例: 渋谷支店"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">口座種別</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="accountType"
                        checked={accountType === "savings"}
                        onChange={() => setAccountType("savings")}
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-text-primary">普通</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="accountType"
                        checked={accountType === "checking"}
                        onChange={() => setAccountType("checking")}
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-text-primary">当座</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">口座番号</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                    className={inputClass}
                    placeholder="1234567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">口座名義</label>
                  <input
                    type="text"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    className={inputClass}
                    placeholder="カタカナで入力"
                  />
                </div>

                {/* 認証ステータス */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-text-primary">認証ステータス:</span>
                  <Badge status={bankName && accountNumber ? "active" : "pending"} />
                  <span className="text-xs text-text-tertiary">
                    {bankName && accountNumber ? "認証済み" : "未認証"}
                  </span>
                </div>

                <button className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">
                  保存する
                </button>
              </div>
            </div>
          )}

          {/* ━━━ Tab 5: 決済設定 ━━━ */}
          {activeTab === "payment" && (
            <div className="bg-white rounded-xl border border-border-light p-6">
              <h2 className="text-lg font-bold text-text-primary mb-6">決済設定</h2>
              <div className="max-w-lg">
                <div className="flex items-start gap-4 p-5 bg-bg-secondary rounded-xl">
                  <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
                    <CreditCard size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-text-primary">Stripe</h3>
                      <Badge status={stripeConnected ? "active" : "draft"} />
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed mb-4">
                      決済サービス連携。クレジットカード・銀行振込を受け付けます。生徒からのレッスン料の受け取りに使用されます。
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-secondary">
                        {stripeConnected ? "接続済み" : "未接続"}
                      </span>
                      <Toggle checked={stripeConnected} onChange={setStripeConnected} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ━━━ Tab 6: 特定商取引法 ━━━ */}
          {activeTab === "legal" && (
            <div className="bg-white rounded-xl border border-border-light p-6">
              <h2 className="text-lg font-bold text-text-primary mb-6">特定商取引法に基づく表記</h2>
              <div className="space-y-5 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">販売事業者名</label>
                  <input
                    type="text"
                    value={legalSellerName}
                    onChange={(e) => setLegalSellerName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">所在地</label>
                  <textarea
                    value={legalAddress}
                    onChange={(e) => setLegalAddress(e.target.value)}
                    rows={2}
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">電話番号</label>
                  <input
                    type="tel"
                    value={legalPhone}
                    onChange={(e) => setLegalPhone(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">メールアドレス</label>
                  <input
                    type="email"
                    value={legalEmail}
                    onChange={(e) => setLegalEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">販売価格</label>
                  <textarea
                    value={legalPrice}
                    onChange={(e) => setLegalPrice(e.target.value)}
                    rows={2}
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">支払い時期</label>
                  <input
                    type="text"
                    value={legalPaymentTiming}
                    onChange={(e) => setLegalPaymentTiming(e.target.value)}
                    className={inputClass}
                    placeholder="例: レッスン申込時"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">引き渡し時期</label>
                  <input
                    type="text"
                    value={legalDeliveryTiming}
                    onChange={(e) => setLegalDeliveryTiming(e.target.value)}
                    className={inputClass}
                    placeholder="例: レッスン当日"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">返品・キャンセルポリシー</label>
                  <textarea
                    value={legalCancelPolicy}
                    onChange={(e) => setLegalCancelPolicy(e.target.value)}
                    rows={4}
                    className={`${inputClass} resize-none`}
                    placeholder="返品・キャンセルに関するポリシーを記載してください"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">特記事項</label>
                  <textarea
                    value={legalNotes}
                    onChange={(e) => setLegalNotes(e.target.value)}
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">
                    保存する
                  </button>
                  <button
                    onClick={() => setLegalPreviewOpen(true)}
                    className="border border-border rounded-lg px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
                  >
                    プレビュー
                  </button>
                </div>
              </div>

              {/* Legal Preview Modal */}
              <Modal open={legalPreviewOpen} onClose={() => setLegalPreviewOpen(false)} title="特定商取引法に基づく表記 - プレビュー" size="lg">
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-medium text-text-primary mb-1">販売事業者名</p>
                    <p className="text-text-secondary">{legalSellerName || "-"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-text-primary mb-1">所在地</p>
                    <p className="text-text-secondary whitespace-pre-wrap">{legalAddress || "-"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-text-primary mb-1">電話番号</p>
                    <p className="text-text-secondary">{legalPhone || "-"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-text-primary mb-1">メールアドレス</p>
                    <p className="text-text-secondary">{legalEmail || "-"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-text-primary mb-1">販売価格</p>
                    <p className="text-text-secondary whitespace-pre-wrap">{legalPrice || "-"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-text-primary mb-1">支払い時期</p>
                    <p className="text-text-secondary">{legalPaymentTiming || "-"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-text-primary mb-1">引き渡し時期</p>
                    <p className="text-text-secondary">{legalDeliveryTiming || "-"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-text-primary mb-1">返品・キャンセルポリシー</p>
                    <p className="text-text-secondary whitespace-pre-wrap">{legalCancelPolicy || "-"}</p>
                  </div>
                  {legalNotes && (
                    <div>
                      <p className="font-medium text-text-primary mb-1">特記事項</p>
                      <p className="text-text-secondary whitespace-pre-wrap">{legalNotes}</p>
                    </div>
                  )}
                </div>
              </Modal>
            </div>
          )}

          {/* ━━━ Tab 7: 通知設定 ━━━ */}
          {activeTab === "notifications" && (
            <div className="bg-white rounded-xl border border-border-light p-6">
              <h2 className="text-lg font-bold text-text-primary mb-6">通知設定</h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-light">
                      <th className="text-left py-3 pr-6 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                        通知項目
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-text-tertiary uppercase tracking-wider w-20">
                        Email
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-text-tertiary uppercase tracking-wider w-20">
                        プッシュ
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-text-tertiary uppercase tracking-wider w-20">
                        LINE
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {notificationCategories.map((cat) => (
                      <Fragment key={cat.category}>
                        <tr>
                          <td colSpan={4} className="pt-5 pb-2">
                            <span className="text-sm font-bold text-text-primary">{cat.category}</span>
                          </td>
                        </tr>
                        {cat.items.map((item) => (
                          <tr key={item.key} className="border-b border-border-light/50">
                            <td className="py-3 pr-6">
                              <span className="text-sm text-text-secondary">{item.label}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex justify-center">
                                <Toggle
                                  checked={notifications[item.key]?.email ?? false}
                                  onChange={() => toggleNotification(item.key, "email")}
                                />
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex justify-center">
                                <Toggle
                                  checked={notifications[item.key]?.push ?? false}
                                  onChange={() => toggleNotification(item.key, "push")}
                                />
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex justify-center">
                                <Toggle
                                  checked={notifications[item.key]?.line ?? false}
                                  onChange={() => toggleNotification(item.key, "line")}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6">
                <button className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">
                  すべて保存
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

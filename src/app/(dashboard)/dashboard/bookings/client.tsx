"use client";

import { useState, useMemo } from "react";
import {
  CalendarDays,
  List,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Mail,
  DollarSign,
  FileText,
  Check,
} from "lucide-react";
import { updateBooking } from "@/lib/actions";
import { Badge } from "@/components/ui/badge";
import { SlideOver } from "@/components/ui/modal";
import type { Booking, BookingStatus } from "@/lib/types";

const statusFilters: { label: string; value: BookingStatus | "all" }[] = [
  { label: "すべて", value: "all" },
  { label: "確定", value: "confirmed" },
  { label: "保留", value: "pending" },
  { label: "キャンセル", value: "cancelled" },
  { label: "完了", value: "completed" },
];

const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
const monthNames = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

function formatYen(amount: number) {
  return `¥${amount.toLocaleString()}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

interface BookingsClientProps {
  initialBookings: Booking[];
}

export function BookingsClient({ initialBookings }: BookingsClientProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);

  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);

  // Calendar state
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Computed values
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const todayBookings = bookings.filter((b) => b.date === todayStr);
  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const thisMonthTotal = bookings
    .filter((b) => b.date.startsWith(thisMonth) && b.status !== "cancelled")
    .reduce((sum, b) => sum + b.amount, 0);

  // Filtered bookings for list view
  const filteredBookings = useMemo(() => {
    if (statusFilter === "all") return bookings;
    return bookings.filter((b) => b.status === statusFilter);
  }, [bookings, statusFilter]);

  // Bookings grouped by date for calendar
  const bookingsByDate = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    for (const b of bookings) {
      if (!map[b.date]) map[b.date] = [];
      map[b.date].push(b);
    }
    return map;
  }, [bookings]);

  // Calendar helpers
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(null);
  };

  const getDateStr = (day: number) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const selectedDayBookings = selectedDay
    ? bookingsByDate[getDateStr(selectedDay)] || []
    : [];

  // SlideOver handlers
  const openBookingDetail = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditNotes(booking.notes);
    setNotesSaved(false);
  };

  const closeBookingDetail = () => {
    setSelectedBooking(null);
  };

  const handleStatusChange = (newStatus: BookingStatus) => {
    if (!selectedBooking) return;
    // Optimistic local state update
    const updated = { ...selectedBooking, status: newStatus };
    setSelectedBooking(updated);
    setBookings((prev) =>
      prev.map((b) => (b.id === selectedBooking.id ? { ...b, status: newStatus } : b))
    );
    // Fire server action
    updateBooking(selectedBooking.id, { status: newStatus });
  };

  const handleSaveNotes = () => {
    if (!selectedBooking) return;
    // Optimistic local state update
    setSelectedBooking({ ...selectedBooking, notes: editNotes });
    setBookings((prev) =>
      prev.map((b) => (b.id === selectedBooking.id ? { ...b, notes: editNotes } : b))
    );
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
    // Fire server action
    updateBooking(selectedBooking.id, { notes: editNotes });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">予約・スケジュール</h1>
        <div className="flex items-center gap-2 bg-white border border-border-light rounded-lg p-1">
          <button
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
              viewMode === "calendar"
                ? "bg-primary text-white"
                : "text-text-secondary hover:bg-bg-secondary"
            }`}
          >
            <CalendarDays size={14} />
            カレンダー
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
              viewMode === "list"
                ? "bg-primary text-white"
                : "text-text-secondary hover:bg-bg-secondary"
            }`}
          >
            <List size={14} />
            リスト
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-border-light px-5 py-4">
          <p className="text-xs text-text-tertiary mb-1">本日の予約</p>
          <p className="text-xl font-bold text-text-primary">{todayBookings.length}件</p>
        </div>
        <div className="bg-white rounded-xl border border-border-light px-5 py-4">
          <p className="text-xs text-text-tertiary mb-1">保留中</p>
          <p className="text-xl font-bold text-warning">{pendingBookings.length}件</p>
        </div>
        <div className="bg-white rounded-xl border border-border-light px-5 py-4">
          <p className="text-xs text-text-tertiary mb-1">今月合計</p>
          <p className="text-xl font-bold text-text-primary">{formatYen(thisMonthTotal)}</p>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === "calendar" ? (
        <div className="flex gap-6">
          {/* Calendar */}
          <div className="flex-1 bg-white rounded-xl border border-border-light p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
              >
                <ChevronLeft size={20} className="text-text-secondary" />
              </button>
              <h2 className="text-lg font-bold text-text-primary">
                {currentYear}年 {monthNames[currentMonth]}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
              >
                <ChevronRight size={20} className="text-text-secondary" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-0">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-text-tertiary py-2 border-b border-border-light"
                >
                  {day}
                </div>
              ))}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="h-20 border-b border-r border-border-light"
                />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = getDateStr(day);
                const isToday =
                  day === now.getDate() &&
                  currentMonth === now.getMonth() &&
                  currentYear === now.getFullYear();
                const isSelected = selectedDay === day;
                const dayBookings = bookingsByDate[dateStr] || [];
                const bookingCount = dayBookings.length;

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`h-20 border-b border-r border-border-light p-1.5 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-primary/5 ring-2 ring-primary/30 ring-inset"
                        : "hover:bg-bg-secondary/50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className={`text-sm inline-flex items-center justify-center w-7 h-7 rounded-full ${
                          isToday
                            ? "bg-accent text-white font-bold"
                            : "text-text-primary"
                        }`}
                      >
                        {day}
                      </span>
                      {bookingCount > 0 && (
                        <span className="text-[10px] font-medium text-text-tertiary bg-bg-secondary rounded px-1 py-0.5">
                          {bookingCount}件
                        </span>
                      )}
                    </div>
                    {bookingCount > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {dayBookings.slice(0, 3).map((b) => (
                          <span
                            key={b.id}
                            className="w-1.5 h-1.5 rounded-full bg-accent"
                          />
                        ))}
                        {bookingCount > 3 && (
                          <span className="text-[9px] text-text-tertiary">
                            +{bookingCount - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Selected Day Bookings */}
          <div className="w-80 bg-white rounded-xl border border-border-light p-5 h-fit">
            <h3 className="text-sm font-bold text-text-primary mb-4">
              {selectedDay
                ? `${currentYear}年${currentMonth + 1}月${selectedDay}日の予約`
                : "日付を選択してください"}
            </h3>
            {selectedDay && selectedDayBookings.length === 0 && (
              <p className="text-sm text-text-tertiary">この日の予約はありません</p>
            )}
            <div className="space-y-3">
              {selectedDayBookings.map((booking) => (
                <div
                  key={booking.id}
                  onClick={() => openBookingDetail(booking)}
                  className="border border-border-light rounded-lg p-3 hover:border-primary/30 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-text-primary">
                      {booking.startTime} - {booking.endTime}
                    </span>
                    <Badge status={booking.status} />
                  </div>
                  <p className="text-sm text-text-secondary">{booking.serviceName}</p>
                  <p className="text-xs text-text-tertiary mt-1">{booking.customerName}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div>
          {/* Filter Buttons */}
          <div className="flex items-center gap-2 mb-4">
            {statusFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === f.value
                    ? "bg-primary text-white"
                    : "border border-border rounded-lg text-text-secondary hover:bg-bg-secondary"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-border-light overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-light">
                  <th className="text-left px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    日時
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    サービス名
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    顧客名
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="text-right px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    金額
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <CalendarDays size={40} className="text-border mb-3" />
                        <p className="text-sm text-text-tertiary">
                          予約はありません
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      onClick={() => openBookingDetail(booking)}
                      className="border-b border-border-light last:border-b-0 hover:bg-bg-secondary/50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-text-primary">
                          {formatDate(booking.date)}
                        </p>
                        <p className="text-xs text-text-tertiary">
                          {booking.startTime} - {booking.endTime}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-text-primary">{booking.serviceName}</p>
                        <Badge status={booking.serviceType} className="mt-1" />
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-text-primary">{booking.customerName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge status={booking.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm font-medium text-text-primary">
                          {formatYen(booking.amount)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openBookingDetail(booking);
                          }}
                          className="text-sm text-accent hover:underline"
                        >
                          詳細
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Detail SlideOver */}
      <SlideOver
        open={!!selectedBooking}
        onClose={closeBookingDetail}
        title="予約詳細"
      >
        {selectedBooking && (
          <div className="space-y-6">
            {/* Customer Info */}
            <div>
              <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-3">
                顧客情報
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <User size={16} className="text-text-tertiary" />
                  <span className="text-sm text-text-primary">
                    {selectedBooking.customerName}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-text-tertiary" />
                  <span className="text-sm text-text-secondary">
                    {selectedBooking.customerEmail}
                  </span>
                </div>
              </div>
            </div>

            <hr className="border-border-light" />

            {/* Service Info */}
            <div>
              <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-3">
                サービス
              </h3>
              <p className="text-sm font-medium text-text-primary mb-1">
                {selectedBooking.serviceName}
              </p>
              <Badge status={selectedBooking.serviceType} />
            </div>

            <hr className="border-border-light" />

            {/* Date / Time */}
            <div>
              <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-3">
                日時
              </h3>
              <div className="flex items-center gap-3">
                <CalendarDays size={16} className="text-text-tertiary" />
                <span className="text-sm text-text-primary">
                  {formatDate(selectedBooking.date)}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <Clock size={16} className="text-text-tertiary" />
                <span className="text-sm text-text-primary">
                  {selectedBooking.startTime} - {selectedBooking.endTime}
                </span>
              </div>
            </div>

            <hr className="border-border-light" />

            {/* Amount */}
            <div>
              <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-3">
                金額
              </h3>
              <div className="flex items-center gap-3">
                <DollarSign size={16} className="text-text-tertiary" />
                <span className="text-lg font-bold text-text-primary">
                  {formatYen(selectedBooking.amount)}
                </span>
              </div>
            </div>

            <hr className="border-border-light" />

            {/* Status */}
            <div>
              <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-3">
                ステータス
              </h3>
              <div className="mb-3">
                <Badge status={selectedBooking.status} />
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedBooking.status !== "confirmed" && (
                  <button
                    onClick={() => handleStatusChange("confirmed")}
                    className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
                  >
                    確定する
                  </button>
                )}
                {selectedBooking.status !== "cancelled" && (
                  <button
                    onClick={() => handleStatusChange("cancelled")}
                    className="border border-error text-error px-4 py-2 rounded-lg text-sm font-medium hover:bg-error/5 transition-colors"
                  >
                    キャンセルする
                  </button>
                )}
                {selectedBooking.status !== "completed" && (
                  <button
                    onClick={() => handleStatusChange("completed")}
                    className="border border-border rounded-lg px-4 py-2 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
                  >
                    完了にする
                  </button>
                )}
              </div>
            </div>

            <hr className="border-border-light" />

            {/* Notes */}
            <div>
              <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-3">
                メモ
              </h3>
              <div className="flex items-start gap-2">
                <FileText size={16} className="text-text-tertiary mt-2" />
                <textarea
                  value={editNotes}
                  onChange={(e) => {
                    setEditNotes(e.target.value);
                    setNotesSaved(false);
                  }}
                  placeholder="メモを入力..."
                  rows={3}
                  className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 resize-none"
                />
              </div>
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={handleSaveNotes}
                  className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
                >
                  <Check size={14} />
                  保存
                </button>
                {notesSaved && (
                  <span className="text-xs text-success">保存しました</span>
                )}
              </div>
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}

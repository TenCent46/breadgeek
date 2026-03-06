"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Star, User, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/student/bookings", label: "予約一覧", icon: CalendarDays },
  { href: "/student/reviews", label: "レビュー", icon: Star },
  { href: "/student/profile", label: "プロフィール", icon: User },
];

export function StudentShell({
  userName,
  children,
}: {
  userName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="bg-white border-b border-border-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/student/bookings" className="text-lg font-bold text-text-primary">
            BreadGeek
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary">{userName}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-text-tertiary hover:text-text-primary transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Nav */}
      <nav className="bg-white border-b border-border-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    active
                      ? "border-accent text-accent"
                      : "border-transparent text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}

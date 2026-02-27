import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { auth } from "@/lib/auth";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      {/* Header */}
      <header className="border-b border-border-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/">
            <Logo size="small" />
          </Link>
          <div className="flex items-center gap-4">
            {session?.user ? (
              <Link
                href={session.user.role === "TEACHER" ? "/dashboard" : "/"}
                className="text-sm text-text-secondary hover:text-accent transition-colors"
              >
                {session.user.role === "TEACHER" ? "ダッシュボード" : "マイページ"}
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-sm text-accent font-medium hover:underline"
              >
                ログイン
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 text-center text-sm text-text-tertiary">
          &copy; 2026 BreadGeek
        </div>
      </footer>
    </div>
  );
}

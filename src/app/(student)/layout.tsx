import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StudentShell } from "./shell";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <StudentShell userName={session.user.name || "ゲスト"}>
      {children}
    </StudentShell>
  );
}

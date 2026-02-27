import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "./shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  let schoolSlug = "demo-bakery";
  let userName = "ユーザー";

  if (session?.user?.id) {
    const school = await prisma.school.findFirst({
      where: { ownerId: session.user.id },
    });
    if (school) schoolSlug = school.slug;
    userName = session.user.name || "ユーザー";
  }

  return (
    <DashboardShell schoolSlug={schoolSlug} userName={userName}>
      {children}
    </DashboardShell>
  );
}

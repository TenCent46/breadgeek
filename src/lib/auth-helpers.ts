import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireTeacher() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const school = await prisma.school.findFirst({
    where: { ownerId: session.user.id },
  });

  if (!school) redirect("/login");

  return { session, school };
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session;
}

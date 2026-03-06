import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { ProfileClient } from "./client";

export default async function StudentProfilePage() {
  const session = await requireAuth();

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user!.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  return <ProfileClient user={user} />;
}

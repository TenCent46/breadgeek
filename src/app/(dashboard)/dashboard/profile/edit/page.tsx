import { requireTeacher } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { ProfileEditClient } from "./client";

export default async function ProfileEditPage() {
  const { school: baseSchool, session } = await requireTeacher();

  // Fetch full school with new fields
  const school = await prisma.school.findUniqueOrThrow({
    where: { id: baseSchool.id },
    select: {
      id: true,
      name: true,
      description: true,
      location: true,
      imageUrl: true,
      title: true,
      features: true,
      category: true,
      tags: true,
      phone: true,
      instagram: true,
      x: true,
      youtube: true,
      line: true,
      tiktok: true,
    },
  });

  return (
    <ProfileEditClient
      school={school}
      userName={session.user.name || ""}
      userEmail={session.user.email || ""}
    />
  );
}

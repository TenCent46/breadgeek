import { requireTeacher } from "@/lib/auth-helpers";
import { ProfileEditClient } from "./client";

export default async function ProfileEditPage() {
  const { school, session } = await requireTeacher();
  return (
    <ProfileEditClient
      school={{
        id: school.id,
        name: school.name,
        description: school.description,
        location: school.location,
        imageUrl: school.imageUrl,
      }}
      userName={session.user.name || ""}
      userEmail={session.user.email || ""}
    />
  );
}

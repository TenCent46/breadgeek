import { requireTeacher } from "@/lib/auth-helpers";
import { getServices } from "@/lib/dal";
import { ProfileLinkClient } from "./client";

export default async function ProfileLinkPage() {
  const { school } = await requireTeacher();
  const services = await getServices(school.id);
  return (
    <ProfileLinkClient
      services={services}
      schoolSlug={school.slug}
      schoolName={school.name}
    />
  );
}

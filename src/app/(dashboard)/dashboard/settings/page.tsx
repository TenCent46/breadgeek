import { requireTeacher } from "@/lib/auth-helpers";
import { getKitchenSettings } from "@/lib/dal";
import { SettingsClient } from "./client";

export default async function SettingsPage() {
  const { school } = await requireTeacher();
  const settings = await getKitchenSettings(school.id);
  return <SettingsClient initialSettings={settings} />;
}

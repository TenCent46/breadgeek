import { requireTeacher } from "@/lib/auth-helpers";
import { getServices, getRecipes } from "@/lib/dal";
import { ServicesClient } from "./client";

export default async function ServicesPage() {
  const { school } = await requireTeacher();
  const [services, recipes] = await Promise.all([
    getServices(school.id),
    getRecipes(school.id),
  ]);
  return <ServicesClient initialServices={services} recipes={recipes} />;
}

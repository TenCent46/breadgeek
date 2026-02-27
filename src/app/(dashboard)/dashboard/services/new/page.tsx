import { requireTeacher } from "@/lib/auth-helpers";
import { getRecipes } from "@/lib/dal";
import { ServiceNewClient } from "./client";

export default async function ServiceNewPage() {
  const { school } = await requireTeacher();
  const recipes = await getRecipes(school.id);
  return <ServiceNewClient recipes={recipes} />;
}

import { requireTeacher } from "@/lib/auth-helpers";
import { getIngredients, getServices } from "@/lib/dal";
import { RecipeNewClient } from "./client";

export default async function RecipeNewPage() {
  const { school } = await requireTeacher();
  const [ingredients, services] = await Promise.all([
    getIngredients(school.id),
    getServices(school.id),
  ]);
  return <RecipeNewClient ingredients={ingredients} services={services} />;
}

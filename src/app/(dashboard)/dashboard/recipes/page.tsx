import { requireTeacher } from "@/lib/auth-helpers";
import { getRecipes, getServices } from "@/lib/dal";
import { RecipesClient } from "./client";

export default async function RecipesPage() {
  const { school } = await requireTeacher();
  const [recipes, services] = await Promise.all([
    getRecipes(school.id),
    getServices(school.id),
  ]);
  return <RecipesClient initialRecipes={recipes} services={services} />;
}

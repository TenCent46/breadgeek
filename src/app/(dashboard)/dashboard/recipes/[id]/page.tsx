import { requireTeacher } from "@/lib/auth-helpers";
import { getRecipeById, getIngredients, getServices } from "@/lib/dal";
import { notFound } from "next/navigation";
import { RecipeEditClient } from "./client";

export default async function RecipeEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { school } = await requireTeacher();
  const [recipe, ingredients, services] = await Promise.all([
    getRecipeById(school.id, id),
    getIngredients(school.id),
    getServices(school.id),
  ]);
  if (!recipe) notFound();
  return <RecipeEditClient recipe={recipe} ingredients={ingredients} services={services} />;
}

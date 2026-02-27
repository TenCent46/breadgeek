import { requireTeacher } from "@/lib/auth-helpers";
import { getIngredients } from "@/lib/dal";
import { IngredientsClient } from "./client";

export default async function IngredientsPage() {
  const { school } = await requireTeacher();
  const ingredients = await getIngredients(school.id);
  return <IngredientsClient initialIngredients={ingredients} />;
}

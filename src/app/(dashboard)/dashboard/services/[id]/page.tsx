import { requireTeacher } from "@/lib/auth-helpers";
import { getServiceById, getRecipes } from "@/lib/dal";
import { notFound } from "next/navigation";
import { ServiceEditClient } from "./client";

export default async function ServiceEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { school } = await requireTeacher();
  const [service, recipes] = await Promise.all([
    getServiceById(school.id, id),
    getRecipes(school.id),
  ]);
  if (!service) notFound();
  return <ServiceEditClient service={service} recipes={recipes} />;
}

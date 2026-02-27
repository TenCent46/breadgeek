import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServiceById, getReviews, getRecipes } from "@/lib/dal";
import { LessonDetailClient } from "./client";

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;

  const school = await prisma.school.findUnique({
    where: { slug },
    include: { owner: { select: { name: true, image: true } } },
  });

  if (!school) notFound();

  const [service, reviews, recipes] = await Promise.all([
    getServiceById(school.id, id),
    getReviews(school.id),
    getRecipes(school.id),
  ]);

  if (!service) notFound();

  const serviceReviews = reviews.filter((r) => r.serviceId === service.id);
  const linkedRecipe = service.linkedRecipeId
    ? recipes.find((r) => r.id === service.linkedRecipeId)
    : undefined;

  return (
    <LessonDetailClient
      slug={slug}
      service={service}
      serviceReviews={serviceReviews}
      linkedRecipe={linkedRecipe}
      ownerName={school.owner.name || ""}
    />
  );
}

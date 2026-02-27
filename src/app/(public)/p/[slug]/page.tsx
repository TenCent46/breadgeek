import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServices, getReviews } from "@/lib/dal";
import { ClassroomClient } from "./client";

export default async function ClassroomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const school = await prisma.school.findUnique({
    where: { slug },
    include: { owner: { select: { name: true, image: true } } },
  });

  if (!school) notFound();

  const [services, reviews] = await Promise.all([
    getServices(school.id),
    getReviews(school.id),
  ]);

  const publishedServices = services.filter((s) => s.status === "published");

  return (
    <ClassroomClient
      slug={slug}
      schoolName={school.name}
      schoolDescription={school.description || ""}
      schoolLocation={school.location || ""}
      ownerName={school.owner.name || ""}
      services={publishedServices}
      reviews={reviews}
    />
  );
}

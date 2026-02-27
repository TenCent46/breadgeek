import { prisma } from "@/lib/prisma";
import { LessonsClient } from "./client";
import type { ServiceSearchDoc, SchoolSearchDoc } from "@/lib/meilisearch";

export default async function LessonsPage() {
  // Fetch published services with school info for initial render
  const services = await prisma.service.findMany({
    where: { status: "PUBLISHED" },
    include: {
      school: { select: { id: true, name: true, slug: true } },
      schedules: { select: { spotsTaken: true, spotsTotal: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const initialResults: ServiceSearchDoc[] = services.map((s) => ({
    id: s.id,
    schoolId: s.school.id,
    schoolName: s.school.name,
    schoolSlug: s.school.slug,
    title: s.title,
    description: s.description,
    type: s.type,
    category: s.category,
    price: s.price,
    capacity: s.capacity,
    duration: s.duration,
    location: s.location,
    imageUrl: s.images[0] || null,
    hasAvailability: s.schedules.some(
      (sc) => sc.spotsTotal - sc.spotsTaken > 0
    ),
  }));

  // Fetch schools for sidebar
  const schools = await prisma.school.findMany({
    include: {
      owner: { select: { name: true } },
      services: { where: { status: "PUBLISHED" }, select: { id: true } },
    },
  });

  const schoolList: SchoolSearchDoc[] = schools
    .filter((s) => s.services.length > 0)
    .map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      description: s.description,
      location: s.location,
      imageUrl: s.imageUrl,
      ownerName: s.owner.name,
      serviceCount: s.services.length,
      avgRating: 0,
    }));

  const hasMeilisearch = !!process.env.MEILISEARCH_HOST;
  const searchKey = process.env.MEILISEARCH_SEARCH_KEY || "";
  const host = process.env.MEILISEARCH_HOST || "";

  return (
    <LessonsClient
      initialResults={initialResults}
      schools={schoolList}
      meilisearchHost={hasMeilisearch ? host : ""}
      meilisearchKey={hasMeilisearch ? searchKey : ""}
    />
  );
}

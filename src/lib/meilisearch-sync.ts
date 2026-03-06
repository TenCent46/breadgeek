import { prisma } from "@/lib/prisma";
import {
  meili,
  SERVICES_INDEX,
  SCHOOLS_INDEX,
  type ServiceSearchDoc,
  type SchoolSearchDoc,
} from "@/lib/meilisearch";

export async function syncServicesToMeilisearch() {
  const services = await prisma.service.findMany({
    where: { status: "PUBLISHED" },
    include: {
      school: { select: { id: true, name: true, slug: true, location: true } },
      schedules: { select: { date: true, spotsTaken: true, spotsTotal: true }, orderBy: { date: "asc" as const } },
    },
  });

  const now = new Date();
  const docs: ServiceSearchDoc[] = services.map((s) => {
    const futureSchedules = s.schedules.filter(
      (sc) => sc.date >= now && sc.spotsTotal - sc.spotsTaken > 0
    );
    const location = s.location || s.school.location || null;

    return {
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
      location,
      imageUrl: s.images[0] || null,
      hasAvailability: futureSchedules.length > 0,
      nextScheduleDate: futureSchedules[0]?.date.toISOString() || null,
      region: location ? location.split(/[　\s]/)[0] : null,
    };
  });

  const index = meili.index(SERVICES_INDEX);
  await index.addDocuments(docs, { primaryKey: "id" });
  return docs.length;
}

export async function syncSchoolsToMeilisearch() {
  const schools = await prisma.school.findMany({
    include: {
      owner: { select: { name: true } },
      services: {
        where: { status: "PUBLISHED" },
        select: {
          id: true,
          reviews: { select: { rating: true } },
        },
      },
    },
  });

  // Only index schools that have published services
  const activeSchools = schools.filter((s) => s.services.length > 0);

  const docs: SchoolSearchDoc[] = activeSchools.map((s) => {
    const allReviews = s.services.flatMap((svc) => svc.reviews);
    return {
      id: s.id,
      slug: s.slug,
      name: s.name,
      description: s.description,
      location: s.location,
      imageUrl: s.imageUrl,
      ownerName: s.owner.name,
      serviceCount: s.services.length,
      avgRating:
        allReviews.length > 0
          ? Math.round(
              (allReviews.reduce((sum, r) => sum + r.rating, 0) /
                allReviews.length) *
                10
            ) / 10
          : 0,
    };
  });

  const index = meili.index(SCHOOLS_INDEX);
  await index.addDocuments(docs, { primaryKey: "id" });
  return docs.length;
}

export async function configureMeilisearchIndexes() {
  // Services index settings
  const servicesIndex = meili.index(SERVICES_INDEX);
  await servicesIndex.updateSettings({
    searchableAttributes: ["title", "description", "category", "schoolName"],
    filterableAttributes: [
      "type",
      "category",
      "price",
      "hasAvailability",
      "schoolId",
    ],
    sortableAttributes: ["price", "nextScheduleDate"],
    displayedAttributes: [
      "id",
      "schoolId",
      "schoolName",
      "schoolSlug",
      "title",
      "description",
      "type",
      "category",
      "price",
      "capacity",
      "duration",
      "location",
      "imageUrl",
      "hasAvailability",
      "nextScheduleDate",
      "region",
    ],
  });

  // Schools index settings
  const schoolsIndex = meili.index(SCHOOLS_INDEX);
  await schoolsIndex.updateSettings({
    searchableAttributes: ["name", "description", "location"],
    filterableAttributes: ["avgRating"],
    sortableAttributes: ["avgRating", "serviceCount"],
    displayedAttributes: [
      "id",
      "slug",
      "name",
      "description",
      "location",
      "imageUrl",
      "ownerName",
      "serviceCount",
      "avgRating",
    ],
  });
}

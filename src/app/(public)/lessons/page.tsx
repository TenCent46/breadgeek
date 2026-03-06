import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { LessonsClient } from "./client";
import type { ServiceSearchDoc, SchoolSearchDoc } from "@/lib/meilisearch";

export const metadata: Metadata = {
  title: "レッスンを探す - BreadGeek",
  description: "全国のパン教室からお気に入りのレッスンを見つけましょう。カテゴリ、地域、価格帯で絞り込み検索できます。",
  openGraph: {
    title: "レッスンを探す - BreadGeek",
    description: "全国のパン教室からお気に入りのレッスンを見つけましょう。",
  },
};

export default async function LessonsPage() {
  // Fetch published services with school info for initial render
  const services = await prisma.service.findMany({
    where: { status: "PUBLISHED" },
    include: {
      school: { select: { id: true, name: true, slug: true, location: true } },
      schedules: { select: { date: true, spotsTaken: true, spotsTotal: true }, orderBy: { date: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const initialResults: ServiceSearchDoc[] = services.map((s) => {
    const futureSchedules = s.schedules.filter(
      (sc) => sc.date >= now && sc.spotsTotal - sc.spotsTaken > 0
    );
    const location = s.location || s.school.location || null;
    // Extract region (first part before space or full location)
    const region = location ? location.split(/[　\s]/)[0] : null;

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
      region,
    };
  });

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

  // Extract unique regions for filter
  const regions = Array.from(
    new Set(initialResults.map((r) => r.region).filter(Boolean) as string[])
  ).sort();

  const hasMeilisearch = !!process.env.MEILISEARCH_HOST;
  const searchKey = process.env.MEILISEARCH_SEARCH_KEY || "";
  const host = process.env.MEILISEARCH_HOST || "";

  return (
    <LessonsClient
      initialResults={initialResults}
      schools={schoolList}
      regions={regions}
      meilisearchHost={hasMeilisearch ? host : ""}
      meilisearchKey={hasMeilisearch ? searchKey : ""}
    />
  );
}

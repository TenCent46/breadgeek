import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXTAUTH_URL || "https://breadgeek.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/lessons`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/login`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/register`, changeFrequency: "monthly", priority: 0.3 },
  ];

  // Dynamic school pages
  const schools = await prisma.school.findMany({
    select: { slug: true, updatedAt: true },
  });

  const schoolPages: MetadataRoute.Sitemap = schools.map((school) => ({
    url: `${BASE_URL}/p/${school.slug}`,
    lastModified: school.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Dynamic lesson pages
  const services = await prisma.service.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, updatedAt: true, school: { select: { slug: true } } },
  });

  const lessonPages: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${BASE_URL}/p/${service.school.slug}/${service.id}`,
    lastModified: service.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...schoolPages, ...lessonPages];
}

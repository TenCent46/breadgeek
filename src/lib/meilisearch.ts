import { MeiliSearch } from "meilisearch";

export const meili = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || "http://localhost:7700",
  apiKey: process.env.MEILISEARCH_API_KEY || "",
});

export const SERVICES_INDEX = "services";
export const SCHOOLS_INDEX = "schools";

export interface ServiceSearchDoc {
  id: string;
  schoolId: string;
  schoolName: string;
  schoolSlug: string;
  title: string;
  description: string;
  type: string;
  category: string;
  price: number;
  capacity: number | null;
  duration: number | null;
  location: string | null;
  imageUrl: string | null;
  hasAvailability: boolean;
  nextScheduleDate: string | null;
  region: string | null;
}

export interface SchoolSearchDoc {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  location: string | null;
  imageUrl: string | null;
  ownerName: string | null;
  serviceCount: number;
  avgRating: number;
}

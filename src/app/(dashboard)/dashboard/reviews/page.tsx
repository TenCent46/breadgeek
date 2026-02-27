import { requireTeacher } from "@/lib/auth-helpers";
import { getReviews, getServices } from "@/lib/dal";
import { ReviewsClient } from "./client";

export default async function ReviewsPage() {
  const { school } = await requireTeacher();
  const [reviews, services] = await Promise.all([
    getReviews(school.id),
    getServices(school.id),
  ]);
  return <ReviewsClient initialReviews={reviews} services={services} />;
}

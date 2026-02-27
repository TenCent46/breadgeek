import { requireTeacher } from "@/lib/auth-helpers";
import { getBookings } from "@/lib/dal";
import { BookingsClient } from "./client";

export default async function BookingsPage() {
  const { school } = await requireTeacher();
  const bookings = await getBookings(school.id);
  return <BookingsClient initialBookings={bookings} />;
}

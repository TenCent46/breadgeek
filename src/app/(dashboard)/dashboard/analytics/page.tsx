import { requireTeacher } from "@/lib/auth-helpers";
import { getBookings, getCustomers, getServices, getKitchenSettings } from "@/lib/dal";
import { AnalyticsClient } from "./client";

export default async function AnalyticsPage() {
  const { school } = await requireTeacher();
  const [bookings, customers, services, settings] = await Promise.all([
    getBookings(school.id),
    getCustomers(school.id),
    getServices(school.id),
    getKitchenSettings(school.id),
  ]);
  return <AnalyticsClient bookings={bookings} customers={customers} services={services} settings={settings} />;
}

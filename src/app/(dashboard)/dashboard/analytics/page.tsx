import { requireTeacher } from "@/lib/auth-helpers";
import { getBookings, getCustomers, getServices, getKitchenSettings, getMonthlySales } from "@/lib/dal";
import { AnalyticsClient } from "./client";

export default async function AnalyticsPage() {
  const { school } = await requireTeacher();
  const [bookings, customers, services, settings, monthlySales] = await Promise.all([
    getBookings(school.id),
    getCustomers(school.id),
    getServices(school.id),
    getKitchenSettings(school.id),
    getMonthlySales(school.id),
  ]);
  return (
    <AnalyticsClient
      bookings={bookings}
      customers={customers}
      services={services}
      settings={settings}
      monthlySales={monthlySales}
    />
  );
}

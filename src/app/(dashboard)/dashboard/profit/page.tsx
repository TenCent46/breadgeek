import { requireTeacher } from "@/lib/auth-helpers";
import { getServices, getRecipes, getBookings, getKitchenSettings, getMonthlyProfit } from "@/lib/dal";
import { ProfitClient } from "./client";

export default async function ProfitPage() {
  const { school } = await requireTeacher();
  const [services, recipes, bookings, settings, monthlyProfit] = await Promise.all([
    getServices(school.id),
    getRecipes(school.id),
    getBookings(school.id),
    getKitchenSettings(school.id),
    getMonthlyProfit(school.id),
  ]);
  return (
    <ProfitClient
      services={services}
      recipes={recipes}
      bookings={bookings}
      monthlyProfit={monthlyProfit}
      settings={settings}
    />
  );
}

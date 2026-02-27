import { requireTeacher } from "@/lib/auth-helpers";
import {
  getServices, getBookings, getCustomers, getSales,
  getMonthlySales, getMonthlyProfit, getReviews,
  getRecipes, getIngredients, getKitchenSettings,
} from "@/lib/dal";
import { DashboardHomeClient } from "./client";

export default async function DashboardHomePage() {
  const { school } = await requireTeacher();
  const [
    services, bookings, customers, sales, monthlySales, monthlyProfit,
    reviews, recipes, ingredients, settings,
  ] = await Promise.all([
    getServices(school.id),
    getBookings(school.id),
    getCustomers(school.id),
    getSales(school.id),
    getMonthlySales(school.id),
    getMonthlyProfit(school.id),
    getReviews(school.id),
    getRecipes(school.id),
    getIngredients(school.id),
    getKitchenSettings(school.id),
  ]);

  return (
    <DashboardHomeClient
      services={services}
      bookings={bookings}
      customers={customers}
      sales={sales}
      monthlySales={monthlySales}
      monthlyProfit={monthlyProfit}
      reviews={reviews}
      recipes={recipes}
      ingredients={ingredients}
      kitchenSettings={settings}
    />
  );
}

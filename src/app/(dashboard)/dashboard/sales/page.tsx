import { requireTeacher } from "@/lib/auth-helpers";
import { getSales, getMonthlySales, getMonthlyProfit } from "@/lib/dal";
import { SalesClient } from "./client";

export default async function SalesPage() {
  const { school } = await requireTeacher();
  const [sales, monthlySales, monthlyProfit] = await Promise.all([
    getSales(school.id),
    getMonthlySales(school.id),
    getMonthlyProfit(school.id),
  ]);
  return <SalesClient sales={sales} monthlySales={monthlySales} monthlyProfit={monthlyProfit} />;
}

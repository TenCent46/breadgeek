import { requireTeacher } from "@/lib/auth-helpers";
import { getCustomers } from "@/lib/dal";
import { CustomersClient } from "./client";

export default async function CustomersPage() {
  const { school } = await requireTeacher();
  const customers = await getCustomers(school.id);
  return <CustomersClient initialCustomers={customers} />;
}

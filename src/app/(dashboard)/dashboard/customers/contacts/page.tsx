import { requireTeacher } from "@/lib/auth-helpers";
import { getContacts } from "@/lib/dal";
import { ContactsClient } from "./client";

export default async function ContactsPage() {
  const { school } = await requireTeacher();
  const contacts = await getContacts(school.id);
  return <ContactsClient initialContacts={contacts} />;
}

import { requireTeacher } from "@/lib/auth-helpers";
import { getMessages, getMessageTemplates } from "@/lib/dal";
import { MessagesClient } from "./client";

export default async function MessagesPage() {
  const { school } = await requireTeacher();
  const [messages, templates] = await Promise.all([
    getMessages(school.id),
    getMessageTemplates(school.id),
  ]);
  return <MessagesClient initialMessages={messages} templates={templates} />;
}

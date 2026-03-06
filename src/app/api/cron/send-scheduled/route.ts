import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendDistributionEmail } from "@/lib/mail";

export const dynamic = "force-dynamic";

function renderTemplate(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find scheduled messages whose scheduledAt <= now
  const messages = await prisma.distributionMessage.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { lte: new Date() },
    },
    include: {
      school: { select: { id: true, name: true } },
    },
  });

  let totalSent = 0;

  for (const message of messages) {
    // Get target customers for this school
    const customers = await prisma.customer.findMany({
      where: {
        schoolId: message.school.id,
        email: { not: "" },
      },
      select: { name: true, email: true },
    });

    let successCount = 0;

    if (message.channel === "EMAIL") {
      const results = await Promise.allSettled(
        customers.map((c) => {
          const subject = renderTemplate(message.subject, { name: c.name });
          const content = renderTemplate(message.content, { name: c.name });
          return sendDistributionEmail(c.email, subject, content, message.school.name);
        })
      );
      successCount = results.filter((r) => r.status === "fulfilled").length;
    }

    await prisma.distributionMessage.update({
      where: { id: message.id },
      data: {
        status: "SENT",
        sentAt: new Date(),
        recipientCount: successCount,
      },
    });

    totalSent += successCount;
  }

  return NextResponse.json({ messagesProcessed: messages.length, totalSent });
}

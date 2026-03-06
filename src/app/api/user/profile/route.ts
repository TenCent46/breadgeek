import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = (await request.json()) as { name?: string };

  if (name !== undefined) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: name.trim() },
    });
  }

  return NextResponse.json({ ok: true });
}

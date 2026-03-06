import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { profileUpdateSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = profileUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { name } = parsed.data;

  if (name !== undefined) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: name.trim() },
    });
  }

  return NextResponse.json({ ok: true });
}

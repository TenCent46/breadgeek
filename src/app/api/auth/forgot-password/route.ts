import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/mail";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { email } = (await req.json()) as { email: string };

  if (!email) {
    return NextResponse.json(
      { error: "メールアドレスを入力してください" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to prevent email enumeration
  if (!user) {
    return NextResponse.json({ success: true });
  }

  // Delete existing reset tokens for this user
  await prisma.verificationToken.deleteMany({
    where: { identifier: `reset:${email}` },
  });

  // Generate reset token (1h expiry)
  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      identifier: `reset:${email}`,
      token,
      expires: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  try {
    await sendPasswordResetEmail(email, token);
  } catch (e) {
    console.error("Failed to send password reset email:", e);
  }

  return NextResponse.json({ success: true });
}

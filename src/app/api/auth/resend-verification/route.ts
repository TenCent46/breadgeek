import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mail";

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
  if (!user || user.emailVerified) {
    return NextResponse.json({ success: true });
  }

  // Delete existing verification tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  // Generate new token (24h expiry)
  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  try {
    await sendVerificationEmail(email, token);
  } catch (e) {
    console.error("Failed to resend verification email:", e);
  }

  return NextResponse.json({ success: true });
}

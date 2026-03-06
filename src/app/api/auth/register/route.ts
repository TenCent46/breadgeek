import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mail";
import { registerSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // Rate limit: 5 registrations per IP per minute
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const rl = rateLimit(`register:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!rl.success) {
    return NextResponse.json(
      { error: "リクエストが多すぎます。しばらくお待ちください。" },
      { status: 429 }
    );
  }

  const body = await req.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || "入力内容を確認してください";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const { email, password, name, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "このメールアドレスは既に登録されています" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role,
    },
  });

  // If registering as teacher, create a default school
  if (role === "TEACHER") {
    const slug = email.split("@")[0].replace(/[^a-zA-Z0-9-]/g, "-");
    await prisma.school.create({
      data: {
        slug,
        name: `${name}のパン教室`,
        ownerId: user.id,
      },
    });
  }

  // Generate email verification token (24h expiry)
  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  // Send verification email
  try {
    await sendVerificationEmail(email, token);
  } catch (e) {
    console.error("Failed to send verification email:", e);
    // Don't block registration if email fails
  }

  return NextResponse.json({ success: true, userId: user.id });
}

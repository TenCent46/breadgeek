import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password, name, role } = body as {
    email: string;
    password: string;
    name: string;
    role: "TEACHER" | "STUDENT";
  };

  if (!email || !password || !name || !role) {
    return NextResponse.json(
      { error: "必須項目が入力されていません" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "パスワードは8文字以上で入力してください" },
      { status: 400 }
    );
  }

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

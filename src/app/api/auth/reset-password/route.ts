import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { token, password } = (await req.json()) as {
    token: string;
    password: string;
  };

  if (!token || !password) {
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

  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record || !record.identifier.startsWith("reset:")) {
    return NextResponse.json(
      { error: "無効なトークンです" },
      { status: 400 }
    );
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    return NextResponse.json(
      { error: "トークンの有効期限が切れています。もう一度リセットを申請してください。" },
      { status: 400 }
    );
  }

  const email = record.identifier.replace("reset:", "");
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { email },
    data: { passwordHash },
  });

  await prisma.verificationToken.delete({ where: { token } });

  return NextResponse.json({ success: true });
}

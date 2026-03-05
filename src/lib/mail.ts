import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "BreadGeek <info@bakerization.com>";
const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${BASE_URL}/auth/verify?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "【BreadGeek】メールアドレスの確認",
    html: `
      <div style="max-width:480px;margin:0 auto;font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a">
        <div style="text-align:center;padding:32px 0 24px">
          <h1 style="font-size:24px;font-weight:700;margin:0">🍞 BreadGeek</h1>
        </div>
        <div style="background:#fff;border:1px solid #e5e5e5;border-radius:12px;padding:32px">
          <h2 style="font-size:18px;font-weight:600;margin:0 0 16px">メールアドレスの確認</h2>
          <p style="font-size:14px;line-height:1.6;color:#555;margin:0 0 24px">
            BreadGeekへのご登録ありがとうございます。<br>
            以下のボタンをクリックして、メールアドレスを確認してください。
          </p>
          <div style="text-align:center;margin:0 0 24px">
            <a href="${verifyUrl}" style="display:inline-block;background:#f97316;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:8px">
              メールアドレスを確認する
            </a>
          </div>
          <p style="font-size:12px;color:#999;margin:0">
            このリンクは24時間有効です。心当たりがない場合は、このメールを無視してください。
          </p>
        </div>
        <div style="text-align:center;padding:24px 0;font-size:12px;color:#999">
          &copy; BreadGeek - パン教室専用・利益管理OS
        </div>
      </div>
    `,
  });
}

export async function sendDistributionEmail(
  to: string,
  subject: string,
  content: string,
  schoolName: string
) {
  // Convert plain text content to HTML (preserve newlines)
  const htmlContent = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");

  await resend.emails.send({
    from: FROM,
    to,
    subject,
    html: `
      <div style="max-width:560px;margin:0 auto;font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a">
        <div style="text-align:center;padding:32px 0 24px">
          <h1 style="font-size:20px;font-weight:700;margin:0">${schoolName}</h1>
        </div>
        <div style="background:#fff;border:1px solid #e5e5e5;border-radius:12px;padding:32px">
          <div style="font-size:14px;line-height:1.8;color:#333">
            ${htmlContent}
          </div>
        </div>
        <div style="text-align:center;padding:24px 0;font-size:11px;color:#999">
          このメールは ${schoolName} からお送りしています。<br>
          Powered by BreadGeek
        </div>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${BASE_URL}/auth/reset-password?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "【BreadGeek】パスワードリセット",
    html: `
      <div style="max-width:480px;margin:0 auto;font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a">
        <div style="text-align:center;padding:32px 0 24px">
          <h1 style="font-size:24px;font-weight:700;margin:0">🍞 BreadGeek</h1>
        </div>
        <div style="background:#fff;border:1px solid #e5e5e5;border-radius:12px;padding:32px">
          <h2 style="font-size:18px;font-weight:600;margin:0 0 16px">パスワードリセット</h2>
          <p style="font-size:14px;line-height:1.6;color:#555;margin:0 0 24px">
            パスワードリセットのリクエストを受け付けました。<br>
            以下のボタンをクリックして、新しいパスワードを設定してください。
          </p>
          <div style="text-align:center;margin:0 0 24px">
            <a href="${resetUrl}" style="display:inline-block;background:#f97316;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:8px">
              パスワードをリセットする
            </a>
          </div>
          <p style="font-size:12px;color:#999;margin:0">
            このリンクは1時間有効です。心当たりがない場合は、このメールを無視してください。
          </p>
        </div>
        <div style="text-align:center;padding:24px 0;font-size:12px;color:#999">
          &copy; BreadGeek - パン教室専用・利益管理OS
        </div>
      </div>
    `,
  });
}

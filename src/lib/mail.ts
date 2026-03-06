import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "BreadGeek <info@bakerization.com>";
const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

/** Escape HTML special characters to prevent XSS in emails */
function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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
          <h1 style="font-size:20px;font-weight:700;margin:0">${esc(schoolName)}</h1>
        </div>
        <div style="background:#fff;border:1px solid #e5e5e5;border-radius:12px;padding:32px">
          <div style="font-size:14px;line-height:1.8;color:#333">
            ${htmlContent}
          </div>
        </div>
        <div style="text-align:center;padding:24px 0;font-size:11px;color:#999">
          このメールは ${esc(schoolName)} からお送りしています。<br>
          Powered by BreadGeek
        </div>
      </div>
    `,
  });
}

export async function sendBookingConfirmationEmail(
  to: string,
  data: {
    customerName: string;
    lessonTitle: string;
    date: string;
    time: string;
    participants: number;
    amount: number;
    schoolName: string;
    schoolSlug: string;
    paymentType: string;
  }
) {
  const paymentLabel = data.paymentType === "on_site" ? "当日現金払い" : "事前カード決済";
  const lessonUrl = `${BASE_URL}/p/${data.schoolSlug}`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `【${data.schoolName}】ご予約確認 - ${data.lessonTitle}`,
    html: `
      <div style="max-width:480px;margin:0 auto;font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a">
        <div style="text-align:center;padding:32px 0 24px">
          <h1 style="font-size:20px;font-weight:700;margin:0">${esc(data.schoolName)}</h1>
        </div>
        <div style="background:#fff;border:1px solid #e5e5e5;border-radius:12px;padding:32px">
          <h2 style="font-size:18px;font-weight:600;margin:0 0 16px">ご予約ありがとうございます</h2>
          <p style="font-size:14px;line-height:1.6;color:#555;margin:0 0 20px">
            ${esc(data.customerName)}様、以下の内容でご予約を承りました。
          </p>
          <div style="background:#faf8f5;border-radius:8px;padding:20px;margin:0 0 20px">
            <table style="width:100%;font-size:14px;border-collapse:collapse">
              <tr><td style="padding:6px 0;color:#888;width:100px">レッスン</td><td style="padding:6px 0;font-weight:600">${esc(data.lessonTitle)}</td></tr>
              <tr><td style="padding:6px 0;color:#888">日時</td><td style="padding:6px 0">${esc(data.date)} ${esc(data.time)}</td></tr>
              <tr><td style="padding:6px 0;color:#888">参加人数</td><td style="padding:6px 0">${data.participants}名</td></tr>
              <tr><td style="padding:6px 0;color:#888">合計金額</td><td style="padding:6px 0;font-weight:600">&yen;${data.amount.toLocaleString()}</td></tr>
              <tr><td style="padding:6px 0;color:#888">お支払い</td><td style="padding:6px 0">${paymentLabel}</td></tr>
            </table>
          </div>
          <div style="text-align:center;margin:0 0 16px">
            <a href="${lessonUrl}" style="display:inline-block;background:#D4943A;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:8px">
              教室ページを見る
            </a>
          </div>
          <p style="font-size:12px;color:#999;margin:0">キャンセルはレッスン前日までにご連絡ください。</p>
        </div>
        <div style="text-align:center;padding:24px 0;font-size:11px;color:#999">Powered by BreadGeek</div>
      </div>
    `,
  });
}

export async function sendBookingNotificationToTeacher(
  to: string,
  data: {
    customerName: string;
    customerEmail: string;
    lessonTitle: string;
    date: string;
    time: string;
    participants: number;
    amount: number;
  }
) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `【新規予約】${data.customerName}様 - ${data.lessonTitle}`,
    html: `
      <div style="max-width:480px;margin:0 auto;font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a">
        <div style="text-align:center;padding:32px 0 24px">
          <h1 style="font-size:24px;font-weight:700;margin:0">新規予約通知</h1>
        </div>
        <div style="background:#fff;border:1px solid #e5e5e5;border-radius:12px;padding:32px">
          <p style="font-size:14px;color:#555;margin:0 0 20px">新しい予約が入りました。</p>
          <div style="background:#faf8f5;border-radius:8px;padding:20px">
            <table style="width:100%;font-size:14px;border-collapse:collapse">
              <tr><td style="padding:6px 0;color:#888;width:100px">生徒名</td><td style="padding:6px 0;font-weight:600">${esc(data.customerName)}</td></tr>
              <tr><td style="padding:6px 0;color:#888">メール</td><td style="padding:6px 0">${esc(data.customerEmail)}</td></tr>
              <tr><td style="padding:6px 0;color:#888">レッスン</td><td style="padding:6px 0">${esc(data.lessonTitle)}</td></tr>
              <tr><td style="padding:6px 0;color:#888">日時</td><td style="padding:6px 0">${esc(data.date)} ${esc(data.time)}</td></tr>
              <tr><td style="padding:6px 0;color:#888">参加人数</td><td style="padding:6px 0">${data.participants}名</td></tr>
              <tr><td style="padding:6px 0;color:#888">金額</td><td style="padding:6px 0;font-weight:600">&yen;${data.amount.toLocaleString()}</td></tr>
            </table>
          </div>
        </div>
        <div style="text-align:center;padding:24px 0;font-size:11px;color:#999">Powered by BreadGeek</div>
      </div>
    `,
  });
}

export async function sendBookingCancellationEmail(
  to: string,
  data: {
    customerName: string;
    lessonTitle: string;
    date: string;
    time: string;
    schoolName: string;
  }
) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `【${data.schoolName}】予約キャンセルのお知らせ`,
    html: `
      <div style="max-width:480px;margin:0 auto;font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a">
        <div style="text-align:center;padding:32px 0 24px">
          <h1 style="font-size:20px;font-weight:700;margin:0">${esc(data.schoolName)}</h1>
        </div>
        <div style="background:#fff;border:1px solid #e5e5e5;border-radius:12px;padding:32px">
          <h2 style="font-size:18px;font-weight:600;margin:0 0 16px">予約キャンセルのお知らせ</h2>
          <p style="font-size:14px;line-height:1.6;color:#555;margin:0 0 20px">
            ${esc(data.customerName)}様、以下の予約がキャンセルされました。
          </p>
          <div style="background:#faf8f5;border-radius:8px;padding:20px;margin:0 0 20px">
            <table style="width:100%;font-size:14px;border-collapse:collapse">
              <tr><td style="padding:6px 0;color:#888;width:100px">レッスン</td><td style="padding:6px 0">${esc(data.lessonTitle)}</td></tr>
              <tr><td style="padding:6px 0;color:#888">日時</td><td style="padding:6px 0">${esc(data.date)} ${esc(data.time)}</td></tr>
            </table>
          </div>
          <p style="font-size:13px;color:#888;margin:0">またのご予約をお待ちしております。</p>
        </div>
        <div style="text-align:center;padding:24px 0;font-size:11px;color:#999">Powered by BreadGeek</div>
      </div>
    `,
  });
}

export async function sendBookingReminderEmail(
  to: string,
  data: {
    customerName: string;
    lessonTitle: string;
    date: string;
    time: string;
    schoolName: string;
    schoolSlug: string;
    location: string;
  }
) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `【明日のレッスン】${data.lessonTitle} - ${data.schoolName}`,
    html: `
      <div style="max-width:480px;margin:0 auto;font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a">
        <div style="text-align:center;padding:32px 0 24px">
          <h1 style="font-size:20px;font-weight:700;margin:0">${esc(data.schoolName)}</h1>
        </div>
        <div style="background:#fff;border:1px solid #e5e5e5;border-radius:12px;padding:32px">
          <h2 style="font-size:18px;font-weight:600;margin:0 0 16px">明日のレッスンのお知らせ</h2>
          <p style="font-size:14px;line-height:1.6;color:#555;margin:0 0 20px">
            ${esc(data.customerName)}様、明日のレッスンのリマインダーです。
          </p>
          <div style="background:#faf8f5;border-radius:8px;padding:20px;margin:0 0 20px">
            <table style="width:100%;font-size:14px;border-collapse:collapse">
              <tr><td style="padding:6px 0;color:#888;width:100px">レッスン</td><td style="padding:6px 0;font-weight:600">${esc(data.lessonTitle)}</td></tr>
              <tr><td style="padding:6px 0;color:#888">日時</td><td style="padding:6px 0">${esc(data.date)} ${esc(data.time)}</td></tr>
              ${data.location ? `<tr><td style="padding:6px 0;color:#888">場所</td><td style="padding:6px 0">${esc(data.location)}</td></tr>` : ""}
            </table>
          </div>
          <p style="font-size:13px;color:#555;margin:0 0 16px">持ち物をお忘れなくお越しください。お会いできることを楽しみにしています！</p>
          <div style="text-align:center">
            <a href="${BASE_URL}/p/${data.schoolSlug}" style="display:inline-block;background:#D4943A;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:8px">
              教室ページを見る
            </a>
          </div>
        </div>
        <div style="text-align:center;padding:24px 0;font-size:11px;color:#999">Powered by BreadGeek</div>
      </div>
    `,
  });
}

export async function sendReviewRequestEmail(
  to: string,
  data: {
    customerName: string;
    lessonTitle: string;
    schoolName: string;
    reviewUrl: string;
  }
) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `【${data.schoolName}】レッスンはいかがでしたか？`,
    html: `
      <div style="max-width:480px;margin:0 auto;font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a">
        <div style="text-align:center;padding:32px 0 24px">
          <h1 style="font-size:20px;font-weight:700;margin:0">${esc(data.schoolName)}</h1>
        </div>
        <div style="background:#fff;border:1px solid #e5e5e5;border-radius:12px;padding:32px">
          <h2 style="font-size:18px;font-weight:600;margin:0 0 16px">レッスンはいかがでしたか？</h2>
          <p style="font-size:14px;line-height:1.6;color:#555;margin:0 0 20px">
            ${esc(data.customerName)}様、「${esc(data.lessonTitle)}」にご参加いただきありがとうございました。<br>
            ぜひレビューをお寄せください。今後のレッスン改善に活かさせていただきます。
          </p>
          <div style="text-align:center;margin:0 0 16px">
            <a href="${data.reviewUrl}" style="display:inline-block;background:#D4943A;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:8px">
              レビューを書く
            </a>
          </div>
        </div>
        <div style="text-align:center;padding:24px 0;font-size:11px;color:#999">Powered by BreadGeek</div>
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

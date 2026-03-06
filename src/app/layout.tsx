import type { Metadata } from "next";
import { Noto_Sans_JP, Zen_Maru_Gothic, Playfair_Display } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const zenMaruGothic = Zen_Maru_Gothic({
  variable: "--font-zen-maru",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BreadGeek - クリエイター向けサービス販売プラットフォーム",
  description: "あなたの技術・知識・経験をオリジナルのサービスとして販売できるプラットフォーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} ${zenMaruGothic.variable} ${playfairDisplay.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

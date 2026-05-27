import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "フリマライブ - オンライン接客型フリマイベント",
  description: "全国どこからでも！時間限定のオンライン接客型フリマイベント。チャットで出店者と会話しながらお買い物を楽しめます。",
  openGraph: {
    title: "フリマライブ - オンライン接客型フリマイベント",
    description: "全国の出店者と直接チャットで会話しながらお買い物",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className="bg-white antialiased">{children}</body>
    </html>
  );
}

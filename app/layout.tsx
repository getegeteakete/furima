import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import ClientWrapper from "./ClientWrapper";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sans-jp",
});

// スマホ対応の根幹：viewport設定
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // ユーザーのピンチズームは許可（アクセシビリティ）
  themeColor: "#f97316",
};

export const metadata: Metadata = {
  title: "フリマライブ - オンライン接客型フリマイベント",
  description: "全国どこからでも！時間限定のオンライン接客型フリマイベント。チャットで出店者と会話しながらお買い物を楽しめます。",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
  },
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
      <body className="bg-white antialiased">
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}

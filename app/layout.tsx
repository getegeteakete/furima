import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "フリマイベント - オンライン接客型フリマサイト",
  description: "ハンドメイドや古着をオンラインで時間限定販売。チャット接客で安心のショッピング体験",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-white">{children}</body>
    </html>
  );
}

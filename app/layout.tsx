import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Thầy Đỗ Trường Sơn — Đào tạo AI, Khoa học Dữ liệu & Lập trình Thực chiến",
  description: "Cổng học tập trực tuyến LMS cùng Thầy Đỗ Trường Sơn. Chuyên sâu về Trí tuệ Nhân tạo (AI), Kỹ thuật Dữ liệu (Data Science) và Lập trình ứng dụng.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#040404] text-[#ececec]">
        {children}
      </body>
    </html>
  );
}

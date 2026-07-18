import type { Metadata } from "next";
import { Be_Vietnam_Pro, Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import "./effects.css";

const headingFont = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600"],
  variable: "--font-heading",
  display: "swap",
});

const displayFont = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});


export const metadata: Metadata = {
  title: "Crema Lab — The Unseen World of Coffee",
  description: "Hệ thống nghiên cứu, đào tạo và khám phá cà phê — từ những biến số vô hình đến trải nghiệm trong ly.",
  icons: { icon: "/favicon-logo.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${headingFont.variable} ${displayFont.variable} ${bodyFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}

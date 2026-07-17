import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import "./effects.css";

const headingFont = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["700", "800"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Crema Lab — The Unseen World of Coffee",
  description: "Hệ thống nghiên cứu, đào tạo và khám phá cà phê — từ những biến số vô hình đến trải nghiệm trong ly.",
  icons: { icon: "/favicon-logo.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi" className={headingFont.variable}><body>{children}</body></html>;
}

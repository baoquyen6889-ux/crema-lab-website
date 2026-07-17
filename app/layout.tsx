import type { Metadata } from "next";
import "./globals.css";
import "./effects.css";

export const metadata: Metadata = {
  title: "Crema Lab — The Unseen World of Coffee",
  description: "Hệ thống nghiên cứu, đào tạo và khám phá cà phê — từ những biến số vô hình đến trải nghiệm trong ly.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}

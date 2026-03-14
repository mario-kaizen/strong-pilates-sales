import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "STRONG Pilates Sales — Kaizen Collective",
  description: "Sales intelligence and proposal generation for STRONG Pilates prospects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${dmSans.variable} antialiased`}
        style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          backgroundColor: "var(--cream)",
          color: "var(--ink)",
          minHeight: "100vh",
        }}
      >
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: {
    default: "HotelOS — Multi-Property Hotel Management SaaS",
    template: "%s | HotelOS",
  },
  description:
    "HotelOS is a modern SaaS platform for hotel owners and staff to manage multiple properties, rooms, and bookings from a centralized dashboard.",
  keywords: ["SaaS", "Hotel Management", "Next.js", "Prisma", "Full-Stack", "Dashboard"],
  authors: [{ name: "HotelOS" }],
  openGraph: {
    title: "HotelOS — Multi-Property Hotel Management SaaS",
    description:
      "Manage hotels, rooms, bookings, and analytics with a modern, responsive SaaS dashboard.",
    url: "https://hotelos.vercel.app",
    siteName: "HotelOS",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased bg-white text-gray-900`}>
      </body>
    </html>
  );
}



import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Providers } from "./providers";
import "./globals.css";

// Metadata for SEO, social previews, and favicon
export const metadata: Metadata = {
  title: { default: "StayPilot", template: "%s | StayPilot" },
  description: "Modern multi-property hotel management SaaS platform",
  icons: {
    icon: "/favicon.ico", // standard favicon
    shortcut: "/favicon.ico",
  },
  themeColor: "#4F46E5", // Indigo primary color
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#4F46E5" />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased bg-white text-gray-900`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
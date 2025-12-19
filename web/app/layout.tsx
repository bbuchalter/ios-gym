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
  title: "IOS Practice Lab",
  description:
    "An immersive, scrollable classroom where you can rehearse Cisco IOS workflows with live terminals.",
  keywords: [
    "Cisco IOS",
    "network engineering",
    "CyberPatriot",
    "interactive lab",
    "Next.js course",
  ],
  openGraph: {
    title: "IOS Practice Lab",
    description:
      "Interactive lessons, live Cisco-style terminals, and narrative labs for aspiring network engineers.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IOS Practice Lab",
    description:
      "Command the CLI through 11 guided missions with embedded terminals.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-slate-950 text-slate-100 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

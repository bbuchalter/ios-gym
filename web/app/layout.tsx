import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IOS Practice Lab",
  description:
    "An immersive, scrollable classroom where you can rehearse Cisco IOS workflows with live terminals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-gray-100">
        {children}
      </body>
    </html>
  );
}

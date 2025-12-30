import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IOS Gym - Master Cisco Networking',
  description:
    'Train your networking skills with interactive Cisco IOS terminals. Perfect for CyberPatriot, CCNA prep, and network engineering.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-gray-100">{children}</body>
    </html>
  );
}

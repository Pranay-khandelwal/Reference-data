import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Xpertiz Cold Email Automation',
  description: 'Generate personalised cold outreach emails for Xpertiz',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}

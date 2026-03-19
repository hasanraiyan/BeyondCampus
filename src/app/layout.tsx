import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { SetupCheck } from '@/components/SetupCheck';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BeyondCampus - AI Career & Education Platform',
  description:
    'Your AI-powered platform for career guidance, university applications, and educational planning',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          <SetupCheck />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

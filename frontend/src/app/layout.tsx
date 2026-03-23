import type { Metadata } from 'next';
import { Libre_Baskerville } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import { Toaster } from 'sonner';
import AuthProvider from '@/components/auth/AuthProvider';
import ReactQueryProvider from '@/components/providers/ReactQueryProvider';

const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'Nyaya Web — Free Legal Research for India',
  description: 'AI-powered legal research platform for Indian law students and citizens.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${libreBaskerville.variable}`}>
      <body className="bg-ink text-cream selection:bg-gold/30 font-sans">
        <ReactQueryProvider>
          <AuthProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <div className="flex flex-col flex-1 min-w-0">
                <Navbar />
                <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
                  {children}
                </main>
              </div>
            </div>
            <MobileNav />
            <Toaster position="bottom-right" theme="dark" closeButton />
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Newsreader, Manrope } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import { Toaster } from 'sonner';
import AuthModal from '@/components/auth/AuthModal';
import AuthProvider from '@/components/auth/AuthProvider';
import ReactQueryProvider from '@/components/providers/ReactQueryProvider';

const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
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
    <html lang="en" className={`${newsreader.variable} ${manrope.variable}`}>
      <body className="bg-parchment text-ink selection:bg-gold/30 font-sans antialiased">
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
            <AuthModal />
            <Toaster position="bottom-right" theme="light" closeButton />
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import '@/app/globals.css';

// Layout components
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TopBar from '@/components/home/TopBar';

export const metadata: Metadata = {
  title: 'Bank Association Recruitment Portal',
  description: 'Online recruitment portal for cooperative banks',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mr">
      <body className="min-h-screen bg-surface-muted text-text-primary antialiased">
        <TopBar />
        <Header />
        <main className="min-h-[calc(100vh-180px)]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

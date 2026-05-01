import type { Metadata } from 'next';
import '@/app/globals.css';

// Layout components
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TopBar from '@/components/home/TopBar';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/lib/useAuth';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="min-h-screen bg-surface-muted text-text-primary antialiased">
        <AuthProvider>
          <TopBar />
          <Header />
          <main className="min-h-[calc(100vh-180px)]">
            {children}
          </main>
          <Footer />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}


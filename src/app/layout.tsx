
'use client';

import './globals.css';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from "@/components/ui/toaster";
import { useChatLanguage } from '@/hooks/use-chat-language';
import { FirebaseProvider } from '@/hooks/use-firebase';
import { CallNotificationManager } from '@/components/notifications/CallNotification';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDoctorPage = pathname.startsWith('/doctor');
  const showFooter = (pathname === '/' || pathname === '/login') && !isDoctorPage;

  return (
    <>
      {!isDoctorPage && <Header />}
      <main className="flex-grow">{children}</main>
      {showFooter && <Footer />}
      <Toaster />
      <CallNotificationManager />
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { language } = useChatLanguage();
  return (
    <html lang={language} className="scroll-smooth">
      <head>
        <title>Sehat Sathi – Rural Healthcare AI Bot</title>
        <meta name="description" content="Providing rural India with instant, reliable healthcare guidance." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        {/* Favicon and app icons - replace files in `public/` with your provided logo */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/favicon-512.png" />
        <link rel="apple-touch-icon" href="/favicon-192.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#0ea5a1" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <FirebaseProvider>
          <LayoutContent>{children}</LayoutContent>
        </FirebaseProvider>
      </body>
    </html>
  );
}

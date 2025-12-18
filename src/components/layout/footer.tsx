'use client';

import Link from 'next/link';
import { BotMessageSquare } from 'lucide-react';
import { useChatLanguage } from '@/hooks/use-chat-language';
import { translations } from '@/lib/translations';

export function Footer() {
  const { language } = useChatLanguage();
  const t = translations[language];

  const navItems = [
    { href: '/health-guide', label: t.nav.home },
    { href: '/chatbot', label: t.nav.chatbot },
    { href: '/services', label: t.nav.services },
    { href: '/map', label: t.nav.map },
    { href: '/about', label: t.nav.about },
    { href: '/contact', label: t.nav.contact },
  ];

  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <Link href="/" className="flex items-center space-x-3">
            <img src="/logo.png" alt="Sehat Sathi" className="h-14 w-14 object-contain" />
            <span className="font-bold text-xl font-headline">{t.appName}</span>
          </Link>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-foreground/80 transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-8 text-center text-xs text-muted-foreground border-t border-border pt-8 flex flex-col gap-2">
          <p className="font-semibold">
            {t.footer.disclaimer}
          </p>
          <p>
            {t.footer.copyright.replace('{year}', new Date().getFullYear().toString())}
          </p>
          <div className="mt-2">
            <Link href="/admin/login" className="hover:text-primary transition-colors hover:underline">
              Admin Access
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

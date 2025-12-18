'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const navLinks = [
  { href: '/doctor/dashboard', label: 'Dashboard' },
  { href: '/doctor/schedule', label: 'Scheduling' },
  { href: '/doctor/profile', label: 'Profile' },
];

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const auth = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    if (auth) {
      try {
        await signOut(auth as any);
        router.push('/');
      } catch (error) {
        console.error("Logout failed", error);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            <div className="flex items-center">
              <Link href="/" className="flex items-center font-bold text-2xl text-gray-800 dark:text-white">
                <img src="/logo.png" alt="Sehat Sathi" className="h-20 w-auto mr-4 object-contain" />
                <span>Doctor Portal</span>
              </Link>
            </div>
            <nav className="hidden md:flex items-center space-x-4">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === link.href
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="hidden md:block">
              <Button onClick={handleLogout} variant="ghost" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setOpen(v => !v)} aria-label="Toggle menu">
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>
      {/* Mobile nav drawer */}
      {open && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-b shadow-sm">
          <div className="px-4 py-3 space-y-2">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === link.href ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                {link.label}
              </Link>
            ))}
            <div className="pt-2">
              <Button onClick={() => { setOpen(false); handleLogout(); }} variant="ghost" className="w-full">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          </div>
        </div>
      )}
      <main className="flex-grow p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, Settings, Sun, Moon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/ThemeProvider';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const supabase = createClient();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const navLinks = [
    { href: '/', label: 'หน้าแรก' },
    { href: '/compare', label: 'เปรียบเทียบประกัน' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 touch-manipulation">
            <span className="text-2xl">🛡️</span>
            <span className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white">Easy Insurance</span>
          </Link>

          {/* Desktop/iPad Navigation */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors py-2',
                  isActive(link.href)
                    ? 'text-cyan-600'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop/iPad Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <div className="flex items-center space-x-2 lg:space-x-4">
                <Link href="/admin">
                  <Button variant="ghost" size="sm">
                    <Settings size={18} className="mr-1 lg:mr-2" />
                    <span className="hidden lg:inline">Admin</span>
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <User size={18} className="mr-1 lg:mr-2" />
                    <span className="hidden lg:inline">Dashboard</span>
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut size={18} className="lg:mr-2" />
                  <span className="hidden lg:inline">ออกจากระบบ</span>
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    เข้าสู่ระบบ
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">สมัครสมาชิก</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Theme Toggle & Menu Button */}
          <div className="md:hidden flex items-center space-x-1">
            <button
              onClick={toggleTheme}
              className="p-3 text-gray-600 dark:text-gray-300 touch-manipulation"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
            </button>
            <button
              className="p-3 -mr-2 text-gray-600 dark:text-gray-300 touch-manipulation"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 dark:border-gray-800 animate-slide-up">
            <nav className="flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-base font-medium px-2 py-3 rounded-lg touch-manipulation',
                    isActive(link.href)
                      ? 'text-cyan-600 bg-cyan-50'
                      : 'text-gray-600 active:bg-gray-50'
                  )}
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col space-y-2">
                {user ? (
                  <>
                    <Link href="/admin">
                      <Button variant="outline" className="w-full justify-start">
                        <Settings size={18} className="mr-2" />
                        Admin Panel
                      </Button>
                    </Link>
                    <Link href="/dashboard">
                      <Button variant="outline" className="w-full justify-start">
                        <User size={18} className="mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-red-600">
                      <LogOut size={18} className="mr-2" />
                      ออกจากระบบ
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="outline" className="w-full">
                        เข้าสู่ระบบ
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button className="w-full">สมัครสมาชิก</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

import type { Metadata } from 'next';
import { Noto_Sans_Thai } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ToastProvider } from '@/components/ui';
import { PWARegister } from '@/components/PWARegister';
import { ThemeProvider } from '@/components/ThemeProvider';
import ChatBot from '@/components/ChatBot';

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: 'Easy Insurance - เปรียบเทียบประกันง่ายๆ',
  description: 'ระบบเปรียบเทียบประกันที่ใช้งานง่าย ช่วยให้คุณเลือกแผนประกันที่เหมาะสมที่สุด ทั้งประกันสุขภาพ ประกันชีวิต และประกันรถยนต์',
  keywords: ['ประกัน', 'เปรียบเทียบประกัน', 'ประกันสุขภาพ', 'ประกันชีวิต', 'ประกันรถยนต์'],
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
  themeColor: '#0891b2',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Easy Insurance',
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-152x152.png',
  },
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    url: 'https://easy-insurance.vercel.app',
    siteName: 'Easy Insurance',
    title: 'Easy Insurance - เปรียบเทียบประกันง่ายๆ',
    description: 'ระบบเปรียบเทียบประกันที่ใช้งานง่าย ช่วยให้คุณเลือกแผนประกันที่เหมาะสมที่สุด',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Easy Insurance',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Easy Insurance - เปรียบเทียบประกันง่ายๆ',
    description: 'ระบบเปรียบเทียบประกันที่ใช้งานง่าย',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${notoSansThai.className} min-h-screen flex flex-col`}>
        <PWARegister />
        <ThemeProvider>
          <ToastProvider>
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
            <ChatBot />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

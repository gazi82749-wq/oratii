import { Inter, Space_Grotesk, Caveat } from "next/font/google";
import "./globals.css";
import SidebarLayout from "../components/SidebarLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: '--font-heading',
  display: 'swap',
  preload: true,
});
const caveat = Caveat({
  subsets: ["latin"],
  variable: '--font-handwriting',
  display: 'swap',
  preload: false, // Only used in a few places, lazy load
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oratii.vercel.app';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: '%s | Oratii',
    default: 'Oratii | AI Speech & Presentation Coach',
  },
  description: 'Get real-time AI feedback on your vocal pacing, presentation slides, and job interview delivery. Practice smarter, speak better.',
  keywords: ['AI speech coach', 'presentation coach', 'mock interview', 'public speaking', 'AI feedback', 'viva practice'],
  authors: [{ name: 'Oratii' }],
  creator: 'Oratii',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Oratii | AI Speech & Presentation Coach',
    description: 'Get real-time AI feedback on your vocal pacing, presentation slides, and job interview delivery.',
    url: siteUrl,
    siteName: 'Oratii',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oratii | AI Speech & Presentation Coach',
    description: 'Get real-time AI feedback on your vocal pacing, presentation slides, and job interview delivery.',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1B2140',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable} ${spaceGrotesk.variable} ${caveat.variable}`}>
      <head>
        <meta charSet="UTF-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`font-sans bg-[#fafafa] text-slate-900 antialiased`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-white focus:text-slate-900 focus:font-bold focus:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900">
          Skip to content
        </a>
        <SidebarLayout>
          {children}
        </SidebarLayout>
      </body>
    </html>
  );
}

import { Metadata } from "next";
import { Inter, Space_Grotesk, Caveat } from "next/font/google";
import "./globals.css";
import SidebarLayout from "../components/SidebarLayout";
import ServiceWorkerRegister from "../components/ServiceWorkerRegister";
import PwaInstallPrompt from "../components/PwaInstallPrompt";

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
  preload: false,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oratii.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: '%s | Oratii',
    default: 'Oratii | AI Speech & Presentation Coach',
  },
  description: 'Get real-time AI feedback on your vocal pacing, presentation slides, and job interview delivery. Practice smarter, speak better.',
  keywords: [
    'AI speech coach',
    'presentation coach',
    'mock interview practice',
    'public speaking AI',
    'vocal pacing analyzer',
    'viva practice',
    'presentation feedback',
    'AI viva coach'
  ],
  authors: [{ name: 'Oratii' }],
  creator: 'Oratii',
  alternates: {
    canonical: './',
  },
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
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Oratii - AI Speech & Presentation Coach',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oratii | AI Speech & Presentation Coach',
    description: 'Get real-time AI feedback on your vocal pacing, presentation slides, and job interview delivery.',
    images: [`${siteUrl}/og-image.png`],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Oratii',
  },
  manifest: '/manifest.json',
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1B2140',
};

const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Oratii',
  operatingSystem: 'Web',
  applicationCategory: 'EducationalApplication',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description: 'AI-powered speech and presentation coach providing real-time feedback on vocal pacing, filler words, and slide deck delivery.',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '128',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Oratii',
  url: siteUrl,
  logo: `${siteUrl}/favicon.ico`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable} ${spaceGrotesk.variable} ${caveat.variable}`}>
      <head>
        <meta charSet="UTF-8" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className={`font-sans bg-[#fafafa] text-slate-900 antialiased`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-white focus:text-slate-900 focus:font-bold focus:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900">
          Skip to content
        </a>
        <SidebarLayout>
          {children}
        </SidebarLayout>
        <ServiceWorkerRegister />
        <PwaInstallPrompt />
      </body>
    </html>
  );
}

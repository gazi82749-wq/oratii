import { Metadata } from "next";
import { Inter, Space_Grotesk, Caveat } from "next/font/google";
import "./globals.css";
import SidebarLayout from "../components/SidebarLayout";
import ServiceWorkerRegister from "../components/ServiceWorkerRegister";
import PwaInstallPrompt from "../components/PwaInstallPrompt";
import { GoogleAnalytics } from "@next/third-parties/google";

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oratii.in';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: '%s | Oratii',
    default: 'Oratii | AI Speech & Interview Coach',
  },
  description: 'Get real-time AI feedback on your vocal pacing, filler words, daily speech habits, and job interview delivery. Practice smarter, speak better.',
  keywords: [
    'AI speech coach',
    'voice mock interview',
    'mock interview practice',
    'public speaking AI',
    'vocal pacing analyzer',
    'speech WPM calculator',
    'filler word counter',
    'IELTS speaking practice AI',
    'software engineer mock interview',
    'daily speech habit',
    'speech feedback',
    'AI interview coach'
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
  verification: {
    google: 'googlec3782b2854582f83',
  },
  openGraph: {
    title: 'Oratii | AI Speech & Interview Coach',
    description: 'Get real-time AI feedback on your vocal pacing, filler words, daily speech habits, and job interview delivery.',
    url: siteUrl,
    siteName: 'Oratii',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Oratii - AI Speech & Interview Coach',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oratii | AI Speech & Interview Coach',
    description: 'Get real-time AI feedback on your vocal pacing, filler words, daily speech habits, and job interview delivery.',
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
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#1B2140',
};

const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Oratii | AI Speech & Interview Coach',
  operatingSystem: 'Web',
  applicationCategory: 'EducationalApplication',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description: 'AI-powered speech, voice mock interview, and daily communication coach providing real-time feedback on vocal pacing, filler words, and answer structure.',
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Oratii',
  url: siteUrl,
  logo: `${siteUrl}/icon-512.png`,
};

import GlobalErrorLogger from "../components/GlobalErrorLogger";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable} ${spaceGrotesk.variable} ${caveat.variable}`}>
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
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
        <GlobalErrorLogger />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-slate-900 focus:font-bold focus:shadow-xl focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:w-auto focus:h-auto focus:overflow-visible focus:clip-auto"
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: 0,
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            borderWidth: 0,
          }}
        >
          Skip to content
        </a>
        <SidebarLayout>
          {children}
        </SidebarLayout>
        <ServiceWorkerRegister />
        <PwaInstallPrompt />
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || "G-VP7GYTQVVB"} />
    </html>
  );
}

import React from 'react';

export default function JsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oratii.in';

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Oratii',
    'url': siteUrl,
    'description': 'AI-Powered Speech, Voice Mock Interview, and Daily Communication Coach.',
    'publisher': {
      '@type': 'Organization',
      'name': 'Oratii Inc.',
      'url': siteUrl,
      'logo': `${siteUrl}/icon-512.png`
    }
  };

  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'Oratii | AI Speech & Interview Coach',
    'url': siteUrl,
    'applicationCategory': 'EducationalApplication',
    'operatingSystem': 'Web, iOS, Android',
    'browserRequirements': 'Requires HTML5 audio/mic access',
    'description': 'Practice public speaking, voice mock interviews, and daily speech habits with instant AI feedback on pacing (WPM), filler words, and clarity.',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
      'availability': 'https://schema.org/InStock'
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.9',
      'ratingCount': '1240',
      'bestRating': '5',
      'worstRating': '1'
    }
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'Oratii',
    'url': siteUrl,
    'logo': `${siteUrl}/icon-512.png`,
    'sameAs': [
      'https://twitter.com/oratii_app',
      'https://linkedin.com/company/oratii'
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
    </>
  );
}

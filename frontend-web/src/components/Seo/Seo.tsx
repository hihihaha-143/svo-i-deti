// src/components/Seo/Seo.tsx
import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://svo-i-deti.ru';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

interface SeoProps {
  title: string;
  description: string;
  path?: string;         
  image?: string;
  noindex?: boolean;     
  schema?: object;
}

export const Seo = ({
  title,
  description,
  path = '',
  image = DEFAULT_IMAGE,
  noindex = false,
  schema,
}: SeoProps) => {
  const url = `${SITE_URL}${path}`;
  const fullTitle = `${title} — Свои Дети · Богданович`;

  const defaultSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: fullTitle,
    description,
    url,
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Свои Дети · Богданович" />
      <meta property="og:locale" content="ru_RU" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(schema || defaultSchema)}
      </script>
    </Helmet>
  );
};
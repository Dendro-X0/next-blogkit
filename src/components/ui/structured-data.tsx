export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "BlogKit",
    "description": "A production-ready Next.js 16 blog starter kit with everything you need: Auth, Admin, MDX, Analytics, and more.",
    "url": "https://localhost:3000",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Organization",
      "name": "BlogKit Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "BlogKit"
    },
    "datePublished": "2025-01-01",
    "dateModified": "2025-01-01",
    "inLanguage": "en-US",
    "isAccessibleForFree": true,
    "keywords": ["Next.js", "blog", "starter", "kit", "MDX", "auth", "analytics", "CMS", "TypeScript", "Tailwind CSS"],
    "softwareVersion": "1.0.0",
    "downloadUrl": "https://github.com/Dendro-X0/next-blogkit",
    "screenshot": "https://localhost:3000/next-blogkit_dark.png",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "ratingCount": "1"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}

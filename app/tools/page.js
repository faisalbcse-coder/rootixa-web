import { ToolsView } from "@/components/tools/tools-view";

export const metadata = {
  title: "All Tools - Free Online Digital Tools & Utilities | Rootixa",
  description:
    "Browse all free online tools on Rootixa. QR & Barcode generator, image resizers, CV builders, PDF converters, and AI tools with zero installation.",
  alternates: {
    canonical: "https://rootixa.com/tools",
  },
  openGraph: {
    title: "All Tools - Free Online Digital Tools & Utilities | Rootixa",
    description:
      "Browse all free online tools on Rootixa. QR & Barcode generator, image resizers, CV builders, PDF converters, and AI tools with zero installation.",
    url: "https://rootixa.com/tools",
    siteName: "Rootixa",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Tools - Free Online Digital Tools & Utilities | Rootixa",
    description:
      "Browse all free online tools on Rootixa. QR & Barcode generator, image resizers, CV builders, PDF converters, and AI tools with zero installation.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ToolsPage() {
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "All Free Online Tools - Rootixa",
    url: "https://rootixa.com/tools",
    description:
      "Browse all free online tools on Rootixa. QR & Barcode generator, image resizers, CV builders, PDF converters, and AI tools.",
    isPartOf: {
      "@type": "WebSite",
      name: "Rootixa",
      url: "https://rootixa.com",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://rootixa.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "All Tools",
        item: "https://rootixa.com/tools",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ToolsView />
    </>
  );
}

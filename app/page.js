import { HomeView } from "@/components/home/home-view";

export const metadata = {
  title: "Free Online Tools for Work, Study & Everyday Tasks | Rootixa",
  description:
    "Rootixa offers useful online tools for PDFs, images, QR codes, documents, AI and everyday digital tasks. Fast, simple and easy to use.",
  alternates: {
    canonical: "https://rootixa.com",
  },
  openGraph: {
    title: "Free Online Tools for Work, Study & Everyday Tasks | Rootixa",
    description:
      "Rootixa offers useful online tools for PDFs, images, QR codes, documents, AI and everyday digital tasks. Fast, simple and easy to use.",
    url: "https://rootixa.com",
    siteName: "Rootixa",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online Tools for Work, Study & Everyday Tasks | Rootixa",
    description:
      "Rootixa offers useful online tools for PDFs, images, QR codes, documents, AI and everyday digital tasks. Fast, simple and easy to use.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function HomePage() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Rootixa",
    url: "https://rootixa.com",
    description:
      "Rootixa offers useful online tools for PDFs, images, QR codes, documents, AI and everyday digital tasks. Fast, simple and easy to use.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://rootixa.com/?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Rootixa",
    url: "https://rootixa.com",
    logo: "https://rootixa.com/favicon.ico",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is Rootixa?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Rootixa is an online platform that brings useful digital tools together in one simple workspace.",
        },
      },
      {
        "@type": "Question",
        name: "Are Rootixa tools free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Many Rootixa tools are available to use for free. Availability may vary by tool.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need to install software?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Rootixa's online tools are designed to work directly in a web browser.",
        },
      },
      {
        "@type": "Question",
        name: "Can I use Rootixa on mobile?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The homepage and tools should provide a responsive experience across modern mobile, tablet and desktop devices.",
        },
      },
      {
        "@type": "Question",
        name: "What types of tools are available on Rootixa?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Rootixa provides tools for PDFs, images, QR codes, documents, AI, conversions and other everyday digital tasks.",
        },
      },
    ],
  };

  return (
    <>
      {/* Structured Data (JSON-LD) for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Semantic Homepage Client Shell */}
      <HomeView />
    </>
  );
}

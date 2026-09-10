import { LoremIpsumView } from "@/components/lorem-ipsum/lorem-ipsum-view";

export const metadata = {
  title: "Lorem Ipsum Generator — Rootixa",
  description:
    "Generate free Lorem Ipsum placeholder text for websites, designs, documents, and development projects. Instant paragraphs, sentences, and words with zero latency.",
  alternates: {
    canonical: "https://rootixa.com/lorem-ipsum",
  },
  openGraph: {
    title: "Lorem Ipsum Generator — Rootixa",
    description:
      "Generate free Lorem Ipsum placeholder text for websites, designs, documents, and development projects. Instant paragraphs, sentences, and words with zero latency.",
    url: "https://rootixa.com/lorem-ipsum",
    siteName: "Rootixa",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lorem Ipsum Generator — Rootixa",
    description:
      "Generate free Lorem Ipsum placeholder text for websites, designs, documents, and development projects. Instant paragraphs, sentences, and words with zero latency.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LoremIpsumPage() {
  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Lorem Ipsum Generator",
    applicationCategory: "DesignApplication",
    operatingSystem: "All",
    url: "https://rootixa.com/lorem-ipsum",
    description:
      "Generate clean placeholder text for your designs, websites, documents, and projects with customizable paragraph, sentence, and word counts.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    creator: {
      "@type": "Organization",
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
        name: "Tools",
        item: "https://rootixa.com/tools",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Lorem Ipsum Generator",
        item: "https://rootixa.com/lorem-ipsum",
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is Lorem Ipsum?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Lorem Ipsum is standard dummy placeholder text used across typesetting, web design, and graphic layouts since the 1500s. It is derived from Cicero's 45 BC Latin text.",
        },
      },
      {
        "@type": "Question",
        name: "Is the Rootixa Lorem Ipsum Generator free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, the tool is 100% free with unlimited generation, copying, and plain text downloading.",
        },
      },
      {
        "@type": "Question",
        name: "Does this tool send my data to a server?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. The entire generation engine runs 100% locally in your web browser. No external API requests or backend calls are made.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <LoremIpsumView />
    </>
  );
}

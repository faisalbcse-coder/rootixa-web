import { WriterEditor } from "@/components/word/writer-editor";

export const metadata = {
  title: {
    absolute: "Rootixa Writer – Free Online Word Processor | Rootixa",
  },
  description:
    "Write, edit and format documents online with Rootixa Writer, a powerful free online word processor that works directly in your browser.",
  alternates: {
    canonical: "https://rootixa.com/word",
  },
  openGraph: {
    title: "Rootixa Writer – Free Online Word Processor | Rootixa",
    description:
      "Write, edit and format documents online with Rootixa Writer, a powerful free online word processor that works directly in your browser.",
    url: "https://rootixa.com/word",
    siteName: "Rootixa",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rootixa Writer – Free Online Word Processor | Rootixa",
    description:
      "Write, edit and format documents online with Rootixa Writer, a powerful free online word processor that works directly in your browser.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function WordPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Rootixa Writer",
    alternateName: "Free Online Word Processor",
    url: "https://rootixa.com/word",
    description:
      "Write, edit and format documents online with Rootixa Writer, a powerful free online word processor that works directly in your browser.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "All",
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WriterEditor />
    </>
  );
}

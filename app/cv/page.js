import { CVBuilderPage } from "@/components/cv/cv-builder-page";

export const metadata = {
  title: "Rootixa Pro CV Builder — Free Professional Resume Creator",
  description:
    "Create modern, ATS-friendly professional resumes and CVs online for free. Real-time A4 document preview, customizable sections, and instant browser autosave.",
  alternates: {
    canonical: "https://rootixa.com/cv",
  },
  openGraph: {
    title: "Rootixa Pro CV Builder — Free Professional Resume Creator",
    description:
      "Create modern, ATS-friendly professional resumes and CVs online for free. Real-time A4 document preview, customizable sections, and instant browser autosave.",
    url: "https://rootixa.com/cv",
    siteName: "Rootixa",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rootixa Pro CV Builder — Free Professional Resume Creator",
    description:
      "Create modern, ATS-friendly professional resumes and CVs online for free. Real-time A4 document preview, customizable sections, and instant browser autosave.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Rootixa Pro CV Builder",
    applicationCategory: "BusinessApplication",
    operatingSystem: "All",
    url: "https://rootixa.com/cv",
    description:
      "Build a clean, professional CV or resume directly in your browser with real-time A4 preview and local auto-save.",
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
        name: "Pro CV Builder",
        item: "https://rootixa.com/cv",
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
      <CVBuilderPage />
    </>
  );
}

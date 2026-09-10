import { AIBgRemoverView } from "@/components/ai-bg-remover/ai-bg-remover-view";

export const metadata = {
  title: "AI Background Remover & Enhancer — Rootixa",
  description:
    "Remove image backgrounds and enhance image quality with AI in seconds. 100% private, client-side cutouts and 2× super-resolution upscaling with zero server uploads.",
  alternates: {
    canonical: "https://rootixa.com/ai-background-remover",
  },
  openGraph: {
    title: "AI Background Remover & Enhancer — Rootixa",
    description:
      "Remove image backgrounds and enhance image quality with AI in seconds. 100% private, client-side cutouts and 2× super-resolution upscaling with zero server uploads.",
    url: "https://rootixa.com/ai-background-remover",
    siteName: "Rootixa",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Background Remover & Enhancer — Rootixa",
    description:
      "Remove image backgrounds and enhance image quality with AI in seconds. 100% private, client-side cutouts and 2× super-resolution upscaling with zero server uploads.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AIBgRemoverPage() {
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "AI Background Remover & Enhancer",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "All",
    url: "https://rootixa.com/ai-background-remover",
    description:
      "Free online AI tool to remove backgrounds, replace backdrops with custom colors or gradients, and enhance photo resolution with 100% in-browser privacy.",
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
        name: "AI Background Remover & Enhancer",
        item: "https://rootixa.com/ai-background-remover",
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does the AI Background Remover work without uploading my photos?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Rootixa uses an in-browser neural vision and edge-matting engine that processes pixel arrays directly in your web browser. Your images never leave your local device.",
        },
      },
      {
        "@type": "Question",
        name: "Can I add a solid color or custom image background?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Once the background is isolated, you can choose transparent, solid colors with a hex code picker, multi-stop designer gradients, or upload your own custom backdrop image.",
        },
      },
      {
        "@type": "Question",
        name: "What does the 2× AI Upscaling feature do?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Upscale 2× doubles your image dimensions using high-quality bicubic resampling and spatial unsharp masking to enhance edge clarity and restore details.",
        },
      },
      {
        "@type": "Question",
        name: "Is this tool completely free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, Rootixa AI Background Remover & Enhancer is completely free with unlimited cutouts and downloads.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <AIBgRemoverView />
    </>
  );
}

import { ImageResizerView } from "@/components/image-resizer/image-resizer-view";

export const metadata = {
  title: "Image Resizer & Crop Online — Free & Private — Rootixa",
  description:
    "Resize, crop, rotate, flip, and convert JPG, PNG, and WebP images directly in your browser. 100% private, client-side image editing with zero upload latency.",
  alternates: {
    canonical: "https://rootixa.com/image-resizer",
  },
  openGraph: {
    title: "Image Resizer & Crop Online — Free & Private — Rootixa",
    description:
      "Resize, crop, rotate, flip, and convert JPG, PNG, and WebP images directly in your browser. 100% private, client-side image editing with zero upload latency.",
    url: "https://rootixa.com/image-resizer",
    siteName: "Rootixa",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Image Resizer & Crop Online — Free & Private — Rootixa",
    description:
      "Resize, crop, rotate, flip, and convert JPG, PNG, and WebP images directly in your browser. 100% private, client-side image editing with zero upload latency.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ImageResizerPage() {
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Image Resizer & Crop",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "All",
    url: "https://rootixa.com/image-resizer",
    description:
      "Free online tool to resize, crop, rotate, flip, and optimize images for social media, web, and documents with 100% in-browser client-side privacy.",
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
        name: "Image Resizer & Crop",
        item: "https://rootixa.com/image-resizer",
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is this image resizer completely free and private?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! Rootixa Image Resizer & Crop is 100% free with no limits or watermarks. All operations happen directly in your browser using HTML5 Canvas — your photos never leave your device.",
        },
      },
      {
        "@type": "Question",
        name: "Can I lock the aspect ratio while resizing?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The aspect ratio lock is enabled by default. When locked, changing the width automatically recalculates the height proportionally, and vice versa.",
        },
      },
      {
        "@type": "Question",
        name: "Which export formats are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can export and convert your images to JPG, PNG, and modern high-efficiency WebP format with adjustable quality settings.",
        },
      },
      {
        "@type": "Question",
        name: "What social media presets are included?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Presets include Instagram Post (Square & Portrait), Instagram Story, Facebook Cover, YouTube Thumbnail, Twitter / X Header, Full HD (1080p), and 4K UHD.",
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
      <ImageResizerView />
    </>
  );
}

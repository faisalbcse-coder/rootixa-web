import {
  QrCode,
  ImagePlus,
  FileText,
  Sparkles,
  Archive,
  Calculator,
  LayoutGrid,
  SlidersHorizontal,
} from "lucide-react";

// Canonical Tools Data with Semantic Intent Metadata
export const CANONICAL_TOOLS = [
  {
    id: "qr-code",
    name: "QR & BAR Code Generator",
    desc: "Create custom, trackable QR and Bar codes with premium brand logos and custom styling.",
    category: "QR & Barcode",
    categoryId: "qr",
    icon: QrCode,
    iconColor: "text-slate-700 dark:text-slate-300",
    badge: "Live & Free",
    isLive: true,
    link: "/qr-code",
    users: "2.1M",
    rating: 4.9,
    featured: true,
    keywords: [
      "qr", "barcode", "bar code", "scan", "scanner", "wifi", "link", "url",
      "vcard", "contact", "phone", "email", "sms", "whatsapp", "location",
      "menu", "restaurant", "payment", "upi", "matrix", "upc", "ean", "code"
    ],
    intents: [
      "create a qr code",
      "share wifi password with qr",
      "make barcode for product",
      "scan to open website link",
      "digital restaurant menu qr",
      "save contact vcard qr",
      "whatsapp direct message code"
    ],
  },
  {
    id: "image-resizer",
    name: "Image Resizer & Crop",
    desc: "Resize, crop, and optimize images for any social media platform effortlessly.",
    category: "Image Tools",
    categoryId: "image",
    icon: ImagePlus,
    iconColor: "text-indigo-600 dark:text-indigo-400",
    badge: "In Development",
    isLive: false,
    link: "#",
    users: "3.2M",
    rating: 4.9,
    featured: true,
    keywords: [
      "image", "photo", "picture", "pic", "photograph", "chobi", "resizer", "resize",
      "crop", "aspect ratio", "dimension", "width", "height", "scale", "compress",
      "shrink", "reduce size", "reduce mb", "avatar", "profile picture",
      "instagram", "facebook", "youtube thumbnail", "banner", "pixel", "resolution",
      "dpi", "jpg", "png", "webp", "passport size photo"
    ],
    intents: [
      "change photo size and dimensions",
      "crop picture for instagram or social media",
      "make youtube thumbnail resolution",
      "compress photo file size",
      "create passport size photo",
      "scale image width and height"
    ],
  },
  {
    id: "cv-builder",
    name: "Pro CV Builder",
    desc: "Build professional, ATS-friendly resumes in minutes to land your dream job.",
    category: "Document Tools",
    categoryId: "document",
    icon: FileText,
    iconColor: "text-blue-600 dark:text-blue-400",
    badge: "In Development",
    isLive: false,
    link: "#",
    users: "1.5M",
    rating: 4.8,
    featured: true,
    keywords: [
      "cv", "resume", "curriculum vitae", "biodata", "bio data", "job", "career",
      "employment", "hiring", "apply", "job application", "ats", "ats friendly",
      "work history", "profession", "interview", "portfolio", "cover letter",
      "fresher", "experienced", "template", "chakri", "job search", "hire"
    ],
    intents: [
      "build a resume to apply for jobs",
      "create professional cv",
      "make ats compliant resume",
      "write curriculum vitae",
      "prepare biodata for career"
    ],
  },
  {
    id: "bg-remover",
    name: "AI Background Remover & Enhancer",
    desc: "Extract subjects and enhance photo quality using advanced AI in 1 click.",
    category: "AI Tools",
    categoryId: "ai",
    icon: Sparkles,
    iconColor: "text-fuchsia-600 dark:text-fuchsia-400",
    badge: "In Development",
    isLive: false,
    link: "#",
    users: "850K",
    rating: 4.9,
    featured: false,
    keywords: [
      "background", "bg", "remove background", "remove bg", "transparent",
      "transparent background", "png cutout", "cutout", "isolate", "subject",
      "magic erase", "photo eraser", "ai photo", "enhancer", "enhance", "upscale",
      "retouch", "clear photo", "clean background", "white background",
      "ecommerce product photo", "portrait", "face", "chobi background"
    ],
    intents: [
      "remove background from photo",
      "make transparent png image",
      "cut out person or object from picture",
      "clean white background for ecommerce products",
      "enhance and sharpen blurry image with ai",
      "erase unwanted background"
    ],
  },
  {
    id: "pdf-converter",
    name: "Image & PDF Converter",
    desc: "Convert images to PDF or extract images from PDF documents seamlessly.",
    category: "PDF Tools",
    categoryId: "pdf",
    icon: Archive,
    iconColor: "text-violet-600 dark:text-violet-400",
    badge: "In Development",
    isLive: false,
    link: "#",
    users: "4.1M",
    rating: 4.7,
    featured: false,
    keywords: [
      "pdf", "converter", "convert", "image to pdf", "jpg to pdf", "png to pdf",
      "pdf to image", "pdf to jpg", "pdf to png", "extract pdf", "combine pdf",
      "merge pdf", "documents", "document scanner", "pages", "adobe", "acrobat",
      "reader", "print", "scan to pdf", "office doc", "ebook", "compress pdf"
    ],
    intents: [
      "convert photos into single pdf document",
      "turn jpg and png files to pdf",
      "extract images from pdf",
      "combine multiple pictures into a pdf file",
      "convert document format for printing or submission"
    ],
  },
  {
    id: "invoice-generator",
    name: "Invoice Generator",
    desc: "Generate professional invoices and receipts on the go for your clients.",
    category: "Business Tools",
    categoryId: "business",
    icon: Calculator,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    badge: "In Development",
    isLive: false,
    link: "#",
    users: "920K",
    rating: 4.8,
    featured: false,
    keywords: [
      "invoice", "receipt", "bill", "billing", "quotation", "quote", "estimate",
      "client invoice", "freelance bill", "accounting", "pos", "cash memo",
      "voucher", "payment request", "due bill", "tax invoice", "vat", "gst",
      "money", "pricing", "charges", "business invoice", "proforma", "hisab",
      "taka", "dollar", "payment"
    ],
    intents: [
      "create professional invoice for clients",
      "generate billing receipt",
      "make bill with tax and discount calculation",
      "freelance payment quote and invoice",
      "cash memo and voucher for customer"
    ],
  },
];

// Categories Catalog
export const CATEGORIES = [
  { id: "all", name: "All Tools", count: "6 Tools", icon: LayoutGrid },
  { id: "pdf", name: "PDF Tools", count: "Merge & Convert", icon: Archive },
  { id: "image", name: "Image Tools", count: "Resize & Crop", icon: ImagePlus },
  { id: "qr", name: "QR & Barcode", count: "Custom Codes", icon: QrCode },
  { id: "ai", name: "AI Tools", count: "Photo & Text", icon: Sparkles },
  { id: "document", name: "Document Tools", count: "Resumes & Files", icon: FileText },
  { id: "business", name: "Business Tools", count: "Invoicing", icon: Calculator },
  { id: "converters", name: "Converters", count: "Format Tools", icon: SlidersHorizontal },
];

import { Suspense } from "react";
import "./globals.css";
import { VisitorTracker } from "@/components/analytics/visitor-tracker";

export const metadata = {
  metadataBase: new URL("https://rootixa.com"),
  title: {
    default: "Rootixa - Free Online Tools for Work, Study & Everyday Tasks",
    template: "%s | Rootixa",
  },
  description:
    "Rootixa offers useful online tools for PDFs, images, QR codes, documents, AI and everyday digital tasks. Fast, simple and easy to use.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <VisitorTracker />
        </Suspense>
        {children}
      </body>
    </html>
  );
}

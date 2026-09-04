import { Suspense } from "react";
import "./globals.css";
import { VisitorTracker } from "@/components/analytics/visitor-tracker";

export const metadata = {
  title: "Rootixa - All Your Digital Tasks, Solved in Seconds",
  description: "Your 100% free, all-in-one digital workspace. Edit PDFs, generate QR codes, and automate workflows with AI instantly.",
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

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "Bazaar@IITGN — The Community Exchange",
  description: "The official peer-to-peer marketplace for the IIT Gandhinagar community. Buy, sell, and trade textbooks, hostel essentials, cycles, and more.",
  manifest: "/manifest.json",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "Bazaar@IITGN",
    description: "The Community Exchange for IIT Gandhinagar",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#163850",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">
        <Providers>
          <ServiceWorkerRegister />
          {children}
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import type { ReactElement } from "react";
import { Suspense } from "react";
import "./globals.css";
import { Analytics } from "@/analytics/analytics";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { NextIntlClientProvider } from "next-intl";
import type { AbstractIntlMessages } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

export const metadata: Metadata = {
  title: {
    default: "BlogKit",
    template: "%s | BlogKit"
  },
  description: "Modern, production-ready Next.js blog starter kit with Auth, Admin, MDX, Analytics, and more. Launch faster, focus on content.",
  keywords: ["Next.js", "blog", "starter", "kit", "MDX", "auth", "analytics", "CMS", "TypeScript", "Tailwind CSS"],
  authors: [{ name: "BlogKit Team" }],
  creator: "BlogKit",
  publisher: "BlogKit",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "BlogKit",
    description: "Modern, production-ready Next.js blog starter kit with Auth, Admin, MDX, Analytics, and more.",
    siteName: "BlogKit",
    images: [
      {
        url: "/next-blogkit_dark.png",
        width: 1200,
        height: 800,
        alt: "BlogKit UI preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BlogKit",
    description: "Modern, production-ready Next.js blog starter kit with Auth, Admin, MDX, Analytics, and more.",
    images: ["/next-blogkit_dark.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-light.svg", media: "(prefers-color-scheme: light)" },
      { url: "/favicon-dark.svg", media: "(prefers-color-scheme: dark)" },
    ],
    shortcut: "/favicon-light.svg",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" }
    ],
  },
  manifest: "/manifest.json",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<ReactElement> {
  const locale: string = await getLocale();
  const messages: AbstractIntlMessages = await getMessages();
  return (
    <html lang={locale} suppressHydrationWarning className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="BlogKit is a production-ready Next.js 16 blog starter with Auth, Admin, MDX, Analytics, SEO, and more to help you launch faster."
        />
      </head>
      <body className="min-h-screen">
        {/* Skip link for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-primary text-primary-foreground px-3 py-1 rounded"
        >
          Skip to content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider locale={locale} messages={messages}>
            <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
              {children}
            </Suspense>
            <Toaster richColors closeButton />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import type { ReactElement } from "react";
import { Suspense } from "react";
import "./globals.css";
import { Analytics } from "@/analytics/analytics";
import { AutoPageview } from "@/analytics/auto-pageview";
import { DevPageviewToggle } from "@/analytics/dev-pageview-toggle";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { websiteConfig } from "@/config/website";
import { NextIntlClientProvider } from "next-intl";
import type { AbstractIntlMessages } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { WebVitals } from "@/components/analytics/web-vitals";

export const metadata: Metadata = {
  title: "BlogKit",
  description: "Modern, production-ready Next.js blog starter kit",
  icons: {
    icon: [
      { url: "/favicon-light.svg", media: "(prefers-color-scheme: light)" },
      { url: "/favicon-dark.svg", media: "(prefers-color-scheme: dark)" },
    ],
    shortcut: "/favicon-light.svg",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<ReactElement> {
  const locale: string = await getLocale();
  const messages: AbstractIntlMessages = await getMessages();
  return (
    <html lang={locale} suppressHydrationWarning>
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
              <div className="min-h-screen flex flex-col">
                <Header />
                <main id="main-content" className="flex-1">{children}</main>
                <Footer />
                {process.env.NODE_ENV === "production" && (
                  <>
                    <Analytics />
                    {websiteConfig.analytics.enableFirstPartyAnalytics && <AutoPageview />}
                    <WebVitals />
                  </>
                )}
                {process.env.NODE_ENV !== "production" &&
                  websiteConfig.analytics.enableFirstPartyAnalytics && <DevPageviewToggle />}
              </div>
            </Suspense>
            <Toaster richColors closeButton />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

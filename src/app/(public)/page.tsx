import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import StructuredData from "@/components/ui/structured-data";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import type React from "react";
import type { Metadata } from "next";
import {
  FaBullhorn,
  FaChartLine,
  FaEnvelopeOpenText,
  FaFileLines,
  FaGear,
  FaGithub,
  FaGlobe,
  FaLanguage,
  FaLock,
  FaPalette,
} from "react-icons/fa6";

export const metadata: Metadata = {
  title: "BlogKit - Build Your Next Blog in Hours, Not Weeks",
  description: "A production-ready Next.js 16 blog starter kit with everything you need: Auth, Admin, MDX, Analytics, and more. Launch faster, focus on content.",
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
    title: "BlogKit - Build Your Next Blog in Hours, Not Weeks",
    description: "A production-ready Next.js 16 blog starter kit with everything you need: Auth, Admin, MDX, Analytics, and more. Launch faster, focus on content.",
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
    title: "BlogKit - Build Your Next Blog in Hours, Not Weeks",
    description: "A production-ready Next.js 16 blog starter kit with everything you need: Auth, Admin, MDX, Analytics, and more.",
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
};

// Animated section component with scroll-triggered animation
function AnimatedSection({ children, delay = 0, immediate = false }: { children: React.ReactNode; delay?: number; immediate?: boolean }) {
  return (
    <div 
      className={`${immediate ? 'animate-fade-in-up' : 'scroll-animate'} opacity-0`}
      style={{ 
        ...(immediate ? {
          animationDelay: `${delay}ms`,
          animationFillMode: 'forwards'
        } : {
          '--animation-delay': `${delay}ms`
        })
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

// Animated card component for staggered feature animations
function AnimatedCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div 
      className="scroll-animate opacity-0"
      style={{ 
        '--animation-delay': `${delay}ms`
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

export default async function HomePage(): Promise<React.ReactElement> {
  const t = await getTranslations("HomePage");

  const features = [
    {
      Icon: FaLanguage,
      name: t("feature1Title"),
      description: t("feature1Description"),
      href: "/blog/i18n-ready",
      cta: "Deep dive into internationalization",
      className: "",
      background: (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_60%_at_0%_0%,hsl(var(--primary)/0.08),transparent_60%),radial-gradient(120%_60%_at_100%_100%,hsl(var(--secondary)/0.08),transparent_60%)]" />
      ),
    },
    {
      Icon: FaFileLines,
      name: t("feature2Title"),
      description: t("feature2Description"),
      href: "/blog/mdx-support",
      cta: "See how MDX powers docs",
      className: "",
      background: (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_60%_at_0%_0%,hsl(var(--primary)/0.08),transparent_60%),radial-gradient(120%_60%_at_100%_100%,hsl(var(--secondary)/0.08),transparent_60%)]" />
      ),
    },
    {
      Icon: FaLock,
      name: t("feature3Title"),
      description: t("feature3Description"),
      href: "/blog/secure-auth",
      cta: "Review secure auth stack",
      className: "",
      background: (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_60%_at_0%_0%,hsl(var(--primary)/0.08),transparent_60%),radial-gradient(120%_60%_at_100%_100%,hsl(var(--secondary)/0.08),transparent_60%)]" />
      ),
    },
    {
      Icon: FaPalette,
      name: t("feature4Title"),
      description: t("feature4Description"),
      href: "/blog/theming",
      cta: "Explore theming options",
      className: "",
      background: (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_60%_at_0%_0%,hsl(var(--primary)/0.08),transparent_60%),radial-gradient(120%_60%_at_100%_100%,hsl(var(--secondary)/0.08),transparent_60%)]" />
      ),
    },
    {
      Icon: FaGlobe,
      name: t("feature5Title"),
      description: t("feature5Description"),
      href: "/blog/seo-optimized",
      cta: "Optimize SEO workflows",
      className: "",
      background: (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_60%_at_0%_0%,hsl(var(--primary)/0.08),transparent_60%),radial-gradient(120%_60%_at_100%_100%,hsl(var(--secondary)/0.08),transparent_60%)]" />
      ),
    },
    {
      Icon: FaGear,
      name: t("feature6Title"),
      description: t("feature6Description"),
      href: "/blog/extensible-and-customizable",
      cta: "Customize the starter kit",
      className: "",
      background: (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_60%_at_0%_0%,hsl(var(--primary)/0.08),transparent_60%),radial-gradient(120%_60%_at_100%_100%,hsl(var(--secondary)/0.08),transparent_60%)]" />
      ),
    },
    {
      Icon: FaChartLine,
      name: t("feature7Title"),
      description: t("feature7Description"),
      href: "/blog/analytics",
      cta: "Track product analytics",
      className: "",
      background: (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_60%_at_0%_0%,hsl(var(--primary)/0.08),transparent_60%),radial-gradient(120%_60%_at_100%_100%,hsl(var(--secondary)/0.08),transparent_60%)]" />
      ),
    },
    {
      Icon: FaBullhorn,
      name: t("feature8Title"),
      description: t("feature8Description"),
      href: "/blog/advertising",
      cta: "Monetize with advertising",
      className: "",
      background: (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_60%_at_0%_0%,hsl(var(--primary)/0.08),transparent_60%),radial-gradient(120%_60%_at_100%_100%,hsl(var(--secondary)/0.08),transparent_60%)]" />
      ),
    },
    {
      Icon: FaEnvelopeOpenText,
      name: t("feature9Title"),
      description: t("feature9Description"),
      href: "/blog/email-templates",
      cta: "Preview email templates",
      className: "",
      background: (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_60%_at_0%_0%,hsl(var(--primary)/0.08),transparent_60%),radial-gradient(120%_60%_at_100%_100%,hsl(var(--secondary)/0.08),transparent_60%)]" />
      ),
    },
  ];

  return (
    <Suspense fallback={<main className="container mx-auto px-4 py-12 sm:py-24">Loading...</main>}>
      <StructuredData />
      <main className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_10%_0%,hsl(var(--primary)/0.12),transparent_60%),radial-gradient(120%_80%_at_90%_20%,hsl(var(--secondary)/0.12),transparent_55%)]" />
        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <AnimatedSection delay={100} immediate={true}>
            <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="max-w-xl">
              <AnimatedSection delay={200} immediate={true}>
                <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-sm text-muted-foreground backdrop-blur">
                  <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
                  <span>Next.js 16 blog starter</span>
                </div>
              </AnimatedSection>
              <AnimatedSection delay={300} immediate={true}>
                <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  {t("title")}
                </h1>
              </AnimatedSection>
              <AnimatedSection delay={400} immediate={true}>
                <p className="mt-4 text-lg text-muted-foreground">{t("subtitle")}</p>
              </AnimatedSection>
              <AnimatedSection delay={500} immediate={true}>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <Link href="/blog">Explore the blog</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="https://blogkit-pro.vercel.app" target="_blank">
                      {t("proButton")}
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="lg">
                    <Link href="https://github.com/Dendro-X0/next-blogkit" target="_blank">
                      <FaGithub className="mr-2 h-5 w-5" />
                      {t("githubButton")}
                    </Link>
                  </Button>
                </div>
              </AnimatedSection>
              <AnimatedSection delay={600} immediate={true}>
                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                  <AnimatedCard delay={700}>
                    <Card className="py-4">
                      <CardContent className="px-5">
                        <div className="text-2xl font-semibold">i18n</div>
                        <div className="text-sm text-muted-foreground">Multi-language ready</div>
                      </CardContent>
                    </Card>
                  </AnimatedCard>
                  <AnimatedCard delay={800}>
                    <Card className="py-4">
                      <CardContent className="px-5">
                        <div className="text-2xl font-semibold">SEO</div>
                        <div className="text-sm text-muted-foreground">Sitemaps + metadata</div>
                      </CardContent>
                    </Card>
                  </AnimatedCard>
                  <AnimatedCard delay={900}>
                    <Card className="py-4">
                      <CardContent className="px-5">
                        <div className="text-2xl font-semibold">MDX</div>
                        <div className="text-sm text-muted-foreground">Docs-like content</div>
                      </CardContent>
                    </Card>
                  </AnimatedCard>
                </div>
              </AnimatedSection>
            </div>
            <AnimatedSection delay={400} immediate={true}>
              <div className="relative">
                <div className="absolute inset-0 sm:-inset-6 -z-10 rounded-3xl bg-linear-to-b from-muted/50 to-background blur-2xl" />
                <div className="overflow-hidden rounded-2xl border bg-background/50 shadow-lg">
                  <Image
                    src="/next-blogkit_dark.png"
                    alt="BlogKit UI preview"
                    width={1200}
                    height={800}
                    priority
                    fetchPriority="high"
                    className="h-auto w-full object-cover"
                    sizes="(min-width: 1024px) 560px, 100vw"
                  />
                </div>
                <div className="mt-4 grid grid-cols-4 gap-3">
                  <AnimatedCard delay={500}>
                    <div className="col-span-1 overflow-hidden rounded-xl border bg-background/50">
                      <Image src="/mobile_1.png" alt="Mobile preview 1" width={320} height={640} loading="lazy" className="h-auto w-full object-cover" sizes="(min-width: 1024px) 120px, 25vw" />
                    </div>
                  </AnimatedCard>
                  <AnimatedCard delay={600}>
                    <div className="col-span-1 overflow-hidden rounded-xl border bg-background/50">
                      <Image src="/mobile_2.png" alt="Mobile preview 2" width={320} height={640} loading="lazy" className="h-auto w-full object-cover" sizes="(min-width: 1024px) 120px, 25vw" />
                    </div>
                  </AnimatedCard>
                  <AnimatedCard delay={700}>
                    <div className="col-span-1 overflow-hidden rounded-xl border bg-background/50">
                      <Image src="/mobile_3.png" alt="Mobile preview 3" width={320} height={640} loading="lazy" className="h-auto w-full object-cover" sizes="(min-width: 1024px) 120px, 25vw" />
                    </div>
                  </AnimatedCard>
                  <AnimatedCard delay={800}>
                    <div className="col-span-1 overflow-hidden rounded-xl border bg-background/50">
                      <Image src="/mobile_4.png" alt="Mobile preview 4" width={320} height={640} loading="lazy" className="h-auto w-full object-cover" sizes="(min-width: 1024px) 120px, 25vw" />
                    </div>
                  </AnimatedCard>
                </div>
              </div>
            </AnimatedSection>
            </section>
          </AnimatedSection>
          <AnimatedSection delay={300}>
            <section className="mt-16 sm:mt-24">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight">Core workflows included</h2>
                <p className="mt-2 text-muted-foreground">A polished foundation for content, marketing, and growth—ready to extend.</p>
              </div>
              <Button asChild variant="outline">
                <Link href="https://next-blogkit.vercel.app/" target="_blank">{t("demoButton")}</Link>
              </Button>
            </div>
            <div className="mt-10">
              <BentoGrid>
                {features.map((feature, index) => (
                  <AnimatedCard key={feature.name} delay={400 + index * 100}>
                    <BentoCard {...feature} />
                  </AnimatedCard>
                ))}
              </BentoGrid>
            </div>
            </section>
          </AnimatedSection>
        </div>
      </main>
    </Suspense>
  );
}

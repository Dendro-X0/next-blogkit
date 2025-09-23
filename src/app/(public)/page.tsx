import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Suspense } from "react";
import type React from "react";
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

export default async function HomePage(): Promise<React.ReactElement> {
  const t = await getTranslations("HomePage");

  const features = [
    {
      Icon: FaLanguage,
      name: t("feature1Title"),
      description: t("feature1Description"),
      href: "/blog/i18n-ready",
      cta: "Learn more",
      background: (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_60%_at_0%_0%,hsl(var(--primary)/0.08),transparent_60%),radial-gradient(120%_60%_at_100%_100%,hsl(var(--secondary)/0.08),transparent_60%)]" />
      ),
      className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-2",
    },
    {
      Icon: FaFileLines,
      name: t("feature2Title"),
      description: t("feature2Description"),
      href: "/blog/mdx-support",
      cta: "Learn more",
      background: (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_60%_at_0%_0%,hsl(var(--primary)/0.08),transparent_60%),radial-gradient(120%_60%_at_100%_100%,hsl(var(--secondary)/0.08),transparent_60%)]" />
      ),
      className: "lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2",
    },
    {
      Icon: FaLock,
      name: t("feature3Title"),
      description: t("feature3Description"),
      href: "/blog/secure-auth",
      cta: "Learn more",
      background: (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_60%_at_0%_0%,hsl(var(--primary)/0.08),transparent_60%),radial-gradient(120%_60%_at_100%_100%,hsl(var(--secondary)/0.08),transparent_60%)]" />
      ),
      className: "lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-2",
    },
    {
      Icon: FaPalette,
      name: t("feature4Title"),
      description: t("feature4Description"),
      href: "/blog/theming",
      cta: "Learn more",
      background: (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_60%_at_0%_0%,hsl(var(--primary)/0.08),transparent_60%),radial-gradient(120%_60%_at_100%_100%,hsl(var(--secondary)/0.08),transparent_60%)]" />
      ),
      className: "lg:col-start-1 lg:col-end-2 lg:row-start-2 lg:row-end-3",
    },
    {
      Icon: FaGlobe,
      name: t("feature5Title"),
      description: t("feature5Description"),
      href: "/blog/seo-optimized",
      cta: "Learn more",
      background: (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_60%_at_0%_0%,hsl(var(--primary)/0.08),transparent_60%),radial-gradient(120%_60%_at_100%_100%,hsl(var(--secondary)/0.08),transparent_60%)]" />
      ),
      className: "lg:col-start-2 lg:col-end-3 lg:row-start-2 lg:row-end-3",
    },
    {
      Icon: FaGear,
      name: t("feature6Title"),
      description: t("feature6Description"),
      href: "/blog/extensible-and-customizable",
      cta: "Learn more",
      background: (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_60%_at_0%_0%,hsl(var(--primary)/0.08),transparent_60%),radial-gradient(120%_60%_at_100%_100%,hsl(var(--secondary)/0.08),transparent_60%)]" />
      ),
      className: "lg:col-start-3 lg:col-end-4 lg:row-start-2 lg:row-end-3",
    },
    {
      Icon: FaChartLine,
      name: t("feature7Title"),
      description: t("feature7Description"),
      href: "/blog/analytics",
      cta: "Learn more",
      background: (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_60%_at_0%_0%,hsl(var(--primary)/0.08),transparent_60%),radial-gradient(120%_60%_at_100%_100%,hsl(var(--secondary)/0.08),transparent_60%)]" />
      ),
      className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
    },
    {
      Icon: FaBullhorn,
      name: t("feature8Title"),
      description: t("feature8Description"),
      href: "/blog/advertising",
      cta: "Learn more",
      background: (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_60%_at_0%_0%,hsl(var(--primary)/0.08),transparent_60%),radial-gradient(120%_60%_at_100%_100%,hsl(var(--secondary)/0.08),transparent_60%)]" />
      ),
      className: "lg:col-start-2 lg:col-end-3 lg:row-start-3 lg:row-end-4",
    },
    {
      Icon: FaEnvelopeOpenText,
      name: t("feature9Title"),
      description: t("feature9Description"),
      href: "/blog/email-templates",
      cta: "Learn more",
      background: (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_60%_at_0%_0%,hsl(var(--primary)/0.08),transparent_60%),radial-gradient(120%_60%_at_100%_100%,hsl(var(--secondary)/0.08),transparent_60%)]" />
      ),
      className: "lg:col-start-3 lg:col-end-4 lg:row-start-3 lg:row-end-4",
    },
  ];

  return (
    <Suspense fallback={<main className="container mx-auto py-12 sm:py-24">Loading...</main>}>
      <main className="container mx-auto py-12 sm:py-24">
        <section className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight lg:text-6xl xl:text-7xl bg-gradient-to-b from-slate-800 to-slate-200 dark:from-white dark:to-slate-900 bg-clip-text text-transparent h-24">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg max-w-2xl mx-auto text-muted-foreground">{t("subtitle")}</p>
        </section>
        <section>
          <BentoGrid className="lg:grid-rows-3">
            {features.map((feature) => (
              <BentoCard key={feature.name} {...feature} />
            ))}
          </BentoGrid>
        </section>
        <section className="mt-16 flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="https://github.com/Dendro-X0/next-blogkit" target="_blank">
              <FaGithub className="mr-2 h-5 w-5" />
              {t("githubButton")}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="https://next-blogkit.vercel.app/" target="_blank">{t("demoButton")}</Link>
          </Button>
        </section>
      </main>
    </Suspense>
  );
}

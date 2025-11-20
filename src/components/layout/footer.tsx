import { NewsletterSignupForm } from "@/components/newsletter-signup-form";
import Link from "next/link";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import { BlogKitLogo } from "@/components/layout/blogkit-logo";

export function Footer() {
  return (
    <footer className="bg-background text-foreground safe-bottom">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-1 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <BlogKitLogo />
              <span className="font-bold text-xl">BlogKit</span>
            </div>
            <p className="text-muted-foreground">
              A modern, modular blog platform built with Next.js and TypeScript.
            </p>
          </div>

          <div className="text-center md:text-left">
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <Link href="/blog" className="hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-foreground transition-colors">
                  Search
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-foreground transition-colors">
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-center md:text-left">
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-center md:text-left">
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex gap-3 justify-center md:justify-start">
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors inline-flex h-11 w-11 items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-ring/50"
                aria-label="GitHub"
              >
                <FaGithub className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors inline-flex h-11 w-11 items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-ring/50"
                aria-label="Twitter"
              >
                <FaTwitter className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors inline-flex h-11 w-11 items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-ring/50"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-1 text-center md:text-left">
            <h3 className="font-semibold mb-4">Stay Updated</h3>
            <p className="text-muted-foreground mb-4">
              Subscribe to our newsletter to get the latest updates and news.
            </p>
            <NewsletterSignupForm />
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-muted-foreground">
          <p className="text-center md:text-left">© 2025 BlogKit. All rights reserved.</p>
          <div className="flex gap-4 text-sm">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Understand how we handle your data in BlogKit.",
};

export default function PrivacyPage(): React.ReactElement {
  return (
    <section className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-muted-foreground mb-4">
        This is a demo privacy policy page for BlogKit. Replace this content with your
        organization&apos;s policy before launching to production.
      </p>
      <h2 className="text-xl font-semibold mb-2">What We Collect</h2>
      <p className="mb-4">Basic account information such as email and name used for authentication.</p>
      <h2 className="text-xl font-semibold mb-2">How We Use Data</h2>
      <p className="mb-4">To provide features like login, password reset, two-factor authentication, and content management.</p>
      <h2 className="text-xl font-semibold mb-2">Contact</h2>
      <p>If you have questions, update this page with your contact details.</p>
    </section>
  );
}

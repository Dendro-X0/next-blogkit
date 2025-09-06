import { PageHeader } from "@/components/ui/page-header";
import { AffiliateLinksClient } from "./_components/affiliate-links-client";

export default function AffiliateLinksPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Affiliate Links"
          description="Manage your affiliate links and track their performance."
        />
        <AffiliateLinksClient />
      </div>
    </div>
  );
}

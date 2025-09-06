import { PageHeader } from "@/components/page-header";
import { Suspense } from "react";
import type React from "react";
import { AdvertisementsClient } from "./_components/advertisements-client";

export default function AdvertisementsPage(): React.ReactElement {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Manage Advertisements"
        description="Create, edit, and manage your ad placements."
      />
      <div className="mt-8">
        <Suspense fallback={<p>Loading advertisements...</p>}>
          <AdvertisementsClient />
        </Suspense>
      </div>
    </div>
  );
}

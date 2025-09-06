"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AffiliateLink } from "@/lib/db/schema";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { AffiliateLinkForm } from "./affiliate-link-form";
import type { AffiliateLinkFormValues } from "./affiliate-link-form";
import { columns as createColumns } from "./columns";

export function AffiliateLinksClient() {
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLink, setSelectedLink] = useState<AffiliateLink | null>(null);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/affiliate-links");
      if (response.ok) {
        const data = await response.json();
        setLinks(data);
      }
    } catch (error) {
      console.error("Failed to fetch affiliate links:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleOpenModal = (link: AffiliateLink | null = null) => {
    setSelectedLink(link);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedLink(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (values: AffiliateLinkFormValues) => {
    setIsSubmitting(true);
    const method = selectedLink ? "PUT" : "POST";
    const url = selectedLink ? `/api/affiliate-links/${selectedLink.id}` : "/api/affiliate-links";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        await fetchLinks();
        handleCloseModal();
      }
    } catch (error) {
      console.error("Failed to save affiliate link:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (linkId: number) => {
    if (confirm("Are you sure you want to delete this link?")) {
      try {
        const response = await fetch(`/api/affiliate-links/${linkId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          await fetchLinks();
        }
      } catch (error) {
        console.error("Failed to delete affiliate link:", error);
      }
    }
  };

  const columns = createColumns({ onEdit: handleOpenModal, onDelete: handleDelete });

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          New Link
        </Button>
      </div>
      <DataTable columns={columns} data={links} isLoading={loading} />
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedLink ? "Edit" : "Create"} Affiliate Link</DialogTitle>
            <DialogDescription className="sr-only">
              {selectedLink ? "Edit affiliate link details" : "Create a new affiliate link"}
            </DialogDescription>
          </DialogHeader>
          <AffiliateLinkForm
            initialData={selectedLink}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

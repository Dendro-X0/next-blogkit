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
import type { Advertisement } from "@/lib/db/schema";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { AdvertisementForm } from "./advertisement-form";
import { columns } from "./columns";

export function AdvertisementsClient() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);

  const fetchAdvertisements = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/advertisements");
      if (response.ok) {
        const data = await response.json();
        setAds(data);
      }
    } catch (error) {
      console.error("Failed to fetch advertisements:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const handleFormSuccess = () => {
    fetchAdvertisements();
    setIsModalOpen(false);
  };

  const openEditModal = (ad: Advertisement) => {
    setSelectedAd(ad);
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setSelectedAd(null);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openNewModal}>
          <Plus className="h-4 w-4 mr-2" />
          New Advertisement
        </Button>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedAd ? "Edit Advertisement" : "Create Advertisement"}</DialogTitle>
            <DialogDescription className="sr-only">
              {selectedAd ? "Edit advertisement details" : "Create a new advertisement"}
            </DialogDescription>
          </DialogHeader>
          <AdvertisementForm advertisement={selectedAd} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
      <DataTable
        columns={columns({ onEdit: openEditModal, onDeleteSuccess: fetchAdvertisements })}
        data={ads}
        isLoading={isLoading}
        filterColumnId="name"
      />
    </>
  );
}

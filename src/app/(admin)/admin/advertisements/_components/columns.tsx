"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Advertisement } from "@/lib/db/schema";
import { formatDate } from "@/lib/utils/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

async function deleteAdvertisement(adId: number) {
  const response = await fetch(`/api/advertisements/${adId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete advertisement");
  }
}

export const columns = ({
  onEdit,
  onDeleteSuccess,
}: {
  onEdit: (ad: Advertisement) => void;
  onDeleteSuccess: () => void;
}): ColumnDef<Advertisement>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "placement",
    header: "Placement",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive");
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => {
      const date = row.getValue("startDate") as string | null;
      return date ? formatDate(date) : "N/A";
    },
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => {
      const date = row.getValue("endDate") as string | null;
      return date ? formatDate(date) : "N/A";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const ad = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(ad)}>Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500"
              onClick={async () => {
                const confirmation = confirm("Are you sure you want to delete this advertisement?");
                if (confirmation) {
                  try {
                    await deleteAdvertisement(ad.id);
                    toast.success("Advertisement deleted successfully.");
                    onDeleteSuccess();
                  } catch {
                    toast.error("Failed to delete advertisement.");
                  }
                }
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

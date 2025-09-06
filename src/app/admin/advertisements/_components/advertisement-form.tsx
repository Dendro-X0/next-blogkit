"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Advertisement } from "@/lib/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  placement: z.enum(["header", "sidebar", "footer", "in_content"]),
  content: z.string().min(1, "Content is required"),
  isActive: z.boolean(),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
});

type AdvertisementFormValues = z.infer<typeof formSchema>;

interface AdvertisementFormProps {
  advertisement: Advertisement | null;
  onSuccess: () => void;
}

export function AdvertisementForm({ advertisement, onSuccess }: AdvertisementFormProps) {
  const form = useForm<AdvertisementFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: advertisement?.name ?? "",
      placement: advertisement?.placement ?? "in_content",
      content: advertisement?.content ?? "",
      isActive: advertisement?.isActive ?? true,
      startDate: advertisement?.startDate ? new Date(advertisement.startDate) : null,
      endDate: advertisement?.endDate ? new Date(advertisement.endDate) : null,
    },
  });

  const onSubmit = async (values: AdvertisementFormValues) => {
    try {
      const method = advertisement ? "PUT" : "POST";
      const url = advertisement ? `/api/advertisements/${advertisement.id}` : "/api/advertisements";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${advertisement ? "update" : "create"} advertisement`);
      }

      toast.success(`Advertisement ${advertisement ? "updated" : "created"} successfully.`);
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unknown error occurred.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Summer Sale Banner" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="placement"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Placement</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a placement" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="header">Header</SelectItem>
                  <SelectItem value="sidebar">Sidebar</SelectItem>
                  <SelectItem value="footer">Footer</SelectItem>
                  <SelectItem value="in_content">In-Content</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content (HTML/Script)</FormLabel>
              <FormControl>
                <Textarea placeholder="<a href='...'>...</a>" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Active</FormLabel>
              </div>
            </FormItem>
          )}
        />
        {/* Date pickers for start and end date can be added here */}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
}

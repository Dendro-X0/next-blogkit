"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { Suspense, useState } from "react";
import { toast } from "sonner";

interface ContactFormData {
  readonly name: string;
  readonly email: string;
  readonly subject: string;
  readonly category: string;
  readonly message: string;
}

/**
 * Contact page with general inquiry form and quick contact information.
 * Uses semantic color tokens to maintain adequate contrast in both light and dark themes.
 */
export default function ContactPage(): React.ReactElement {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field: keyof ContactFormData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      toast.success("Message Sent!", {
        description: "We'll get back to you soon.",
      });
      setIsSubmitted(true);

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        category: "",
        message: "",
      });
    } catch (error) {
      console.error(error);
      toast.error("Error", {
        description: "Failed to send message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      {isSubmitted ? (
        <main className="container mx-auto px-4 py-16 min-h-[60vh] flex items-center justify-center" aria-labelledby="contact-success-title">
          <div className="max-w-md mx-auto text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="h-24 w-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-500" />
            </div>
            <div className="space-y-2">
              <h1 id="contact-success-title" className="text-3xl font-bold tracking-tight">
                Message Sent!
              </h1>
              <p className="text-lg text-muted-foreground">
                Thank you for reaching out. We've received your message and will get back to you shortly.
              </p>
            </div>
            <Button onClick={() => setIsSubmitted(false)} size="lg" className="min-w-[200px]">
              Send Another
            </Button>
          </div>
        </main>
      ) : (
        <main className="container mx-auto px-4 py-12 lg:py-24" aria-labelledby="contact-title">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h1 id="contact-title" className="text-4xl font-bold tracking-tight sm:text-5xl">
                Get in Touch
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Have a question or want to work together? We'd love to hear from you.
              </p>
            </div>

            <div className="grid lg:grid-cols-12 rounded-3xl overflow-hidden border bg-card shadow-xl">
              {/* Contact Info Sidebar */}
              <div className="lg:col-span-5 bg-muted/30 p-8 lg:p-12 space-y-10 border-r-0 lg:border-r">
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold">Contact Information</h2>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">Email</p>
                        <p className="text-muted-foreground break-all">hello@blogplatform.com</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">Phone</p>
                        <p className="text-muted-foreground">+1 (555) 123-4567</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">Office</p>
                        <p className="text-muted-foreground">
                          123 Blog Street<br />
                          San Francisco, CA 94102
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-10 border-t">
                  <h2 className="text-2xl font-semibold">FAQ</h2>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="font-medium">What is your response time?</h3>
                      <p className="text-sm text-muted-foreground">We typically respond within 24 hours during business days, often sooner.</p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">Do you offer technical support?</h3>
                      <p className="text-sm text-muted-foreground">Yes, our team is available to help with any platform-related issues.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-7 bg-background p-8 lg:p-12">
                <div className="space-y-6 mb-8">
                  <h2 className="text-2xl font-semibold">Send us a Message</h2>
                  <p className="text-muted-foreground">
                    Fill out the form below and we will get back to you as soon as possible.
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                  aria-busy={isSubmitting}
                  aria-describedby="form-status"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        autoComplete="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="John Doe"
                        className="bg-muted/30"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="john@example.com"
                        className="bg-muted/30"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        autoComplete="off"
                        value={formData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        placeholder="How can we help?"
                        className="bg-muted/30"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label id="category-label" htmlFor="category">
                        Category
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleInputChange("category", value)}
                      >
                        <SelectTrigger aria-labelledby="category-label" className="bg-muted/30 w-full">
                          <SelectValue placeholder="Select a topic" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="billing">Billing Question</SelectItem>
                          <SelectItem value="feature">Feature Request</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      autoComplete="off"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Tell us a bit more..."
                      rows={5}
                      className="resize-none bg-muted/30"
                      required
                    />
                  </div>

                  <p id="form-status" aria-live="polite" className="sr-only">
                    {isSubmitting ? "Sending your message..." : ""}
                  </p>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full sm:w-auto min-w-[160px]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </main>
      )}
    </Suspense>
  );
}

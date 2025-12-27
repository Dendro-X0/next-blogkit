"use client";

import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function NewsletterSignupForm() {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const response = await fetch("/api/newsletter/subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        if (response.ok) {
          toast.success("Thanks for subscribing!");
          setEmail("");
        } else {
          const data = await response.json();
          toast.error(data.message || "Something went wrong.");
        }
      } catch {
        toast.error("An unexpected error occurred.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md items-center space-x-2">
      <label htmlFor="newsletter-email" className="sr-only">Email address</label>
      <Input
        id="newsletter-email"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={isPending}
        aria-label="Email address"
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Subscribing..." : "Subscribe"}
      </Button>
    </form>
  );
}

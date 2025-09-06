import "server-only";
import { env } from "@/../env";
import { Resend } from "resend";
import type { NewsletterProvider, SubscribeNewsletterParams } from "./types";

export class ResendNewsletterProvider implements NewsletterProvider {
  private audienceId: string | undefined = env.RESEND_AUDIENCE_ID;

  private getResend(): Resend | null {
    try {
      if (!env.RESEND_API_KEY) return null;
      return new Resend(env.RESEND_API_KEY);
    } catch {
      return null;
    }
  }

  async subscribe({ email, firstName, lastName }: SubscribeNewsletterParams): Promise<boolean> {
    try {
      if (!this.audienceId) return false;
      const resend = this.getResend();
      if (!resend) return false;

      const existingContact = await resend.contacts.get({
        audienceId: this.audienceId,
        email: email,
      });

      if (existingContact.data?.unsubscribed) {
        // If the contact exists and is unsubscribed, re-subscribe them.
        await resend.contacts.update({
          id: existingContact.data.id,
          audienceId: this.audienceId,
          unsubscribed: false,
          firstName: firstName,
          lastName: lastName,
        });
      } else if (!existingContact.data) {
        // If the contact does not exist, create them.
        await resend.contacts.create({
          email,
          firstName,
          lastName,
          unsubscribed: false,
          audienceId: this.audienceId,
        });
      }
      // If the contact exists and is already subscribed, do nothing.

      return true;
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      return false;
    }
  }

  async unsubscribe(email: string): Promise<boolean> {
    try {
      if (!this.audienceId) return false;
      const resend = this.getResend();
      if (!resend) return false;
      const existing = await resend.contacts.get({ audienceId: this.audienceId, email });
      if (!existing.data) {
        return true; // already not present
      }
      await resend.contacts.update({
        id: existing.data.id,
        audienceId: this.audienceId,
        unsubscribed: true,
      });
      return true;
    } catch (error) {
      console.error("Error unsubscribing from newsletter:", error);
      return false;
    }
  }

  async getStatus(email: string): Promise<"subscribed" | "unsubscribed" | "unknown"> {
    try {
      if (!this.audienceId) return "unknown";
      const resend = this.getResend();
      if (!resend) return "unknown";
      const existing = await resend.contacts.get({ audienceId: this.audienceId, email });
      if (!existing.data) return "unknown";
      return existing.data.unsubscribed ? "unsubscribed" : "subscribed";
    } catch (error) {
      console.error("Error getting newsletter status:", error);
      return "unknown";
    }
  }
}

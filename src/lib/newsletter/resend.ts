import "server-only";
import { env } from "@/../env";
import { Resend } from "resend";
import type { NewsletterProvider, SubscribeNewsletterParams } from "./types";

export class ResendNewsletterProvider implements NewsletterProvider {
  private resend: Resend;
  private audienceId: string | undefined;

  constructor() {
    this.resend = new Resend(env.RESEND_API_KEY);
    this.audienceId = env.RESEND_AUDIENCE_ID;
  }

  async subscribe({ email, firstName, lastName }: SubscribeNewsletterParams): Promise<boolean> {
    try {
      // Check if audienceId is set
      if (!this.audienceId) {
        console.error("RESEND_AUDIENCE_ID environment variable is not set");
        return false;
      }

      const existingContact = await this.resend.contacts.get({
        audienceId: this.audienceId,
        email: email,
      });

      if (existingContact.data?.unsubscribed) {
        // If the contact exists and is unsubscribed, re-subscribe them.
        await this.resend.contacts.update({
          id: existingContact.data.id,
          audienceId: this.audienceId,
          unsubscribed: false,
          firstName: firstName,
          lastName: lastName,
        });
      } else if (!existingContact.data) {
        // If the contact does not exist, create them.
        await this.resend.contacts.create({
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
}

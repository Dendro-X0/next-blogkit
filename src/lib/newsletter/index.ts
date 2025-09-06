import { ResendNewsletterProvider } from "./resend";
import type { NewsletterProvider, SubscribeNewsletterParams } from "./types";

let newsletterProvider: NewsletterProvider | null = null;

function getNewsletterProvider(): NewsletterProvider {
  if (!newsletterProvider) {
    // For now, we are only supporting Resend. This could be extended to support other providers.
    newsletterProvider = new ResendNewsletterProvider();
  }
  return newsletterProvider;
}

export async function subscribeToNewsletter(params: SubscribeNewsletterParams): Promise<boolean> {
  const provider = getNewsletterProvider();
  return provider.subscribe(params);
}

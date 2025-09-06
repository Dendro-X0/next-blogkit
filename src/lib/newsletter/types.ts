export interface SubscribeNewsletterParams {
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface NewsletterProvider {
  subscribe(params: SubscribeNewsletterParams): Promise<boolean>;
  unsubscribe(email: string): Promise<boolean>;
  getStatus(email: string): Promise<"subscribed" | "unsubscribed" | "unknown">;
}

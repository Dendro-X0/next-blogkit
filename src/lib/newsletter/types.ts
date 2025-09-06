export interface SubscribeNewsletterParams {
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface NewsletterProvider {
  subscribe(params: SubscribeNewsletterParams): Promise<boolean>;
}

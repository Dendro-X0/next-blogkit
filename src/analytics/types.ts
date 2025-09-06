/**
 * Analytics type definitions
 * All types are explicit and readonly-friendly to encourage immutability.
 */

export type AnalyticsEventName =
  | "page_view"
  | "newsletter_signup"
  | "affiliate_click"
  | "ad_click"
  | "login"
  | "register";

export interface TrackOptions {
  readonly name: AnalyticsEventName | (string & {});
  readonly path?: string;
  readonly referrer?: string;
  readonly userId?: string;
  readonly sessionId?: string;
  readonly properties?: Readonly<Record<string, unknown>>;
}

export interface PageViewOptions {
  readonly path: string;
  readonly referrer?: string;
  readonly sessionId?: string;
  readonly userId?: string;
}

export interface IdentifyOptions {
  readonly userId: string;
}

export interface AnalyticsProvider {
  track: (options: TrackOptions) => Promise<void>;
  pageView: (options: PageViewOptions) => Promise<void>;
  identify: (options: IdentifyOptions) => Promise<void>;
}

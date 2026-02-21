import "server-only";

import type { CmsAdapter } from "./adapter";
import { env } from "~/env";
import { NativeCmsAdapter } from "./providers/native";
import { WordPressCmsAdapter } from "./providers/wordpress";
import { SanityCmsAdapter } from "./providers/sanity";

let singleton: CmsAdapter | undefined;

function assertWordPressConfig() {
  if (!env.WORDPRESS_URL) throw new Error("WORDPRESS_URL must be set when CMS_PROVIDER=wordpress");
  if (!env.WORDPRESS_USERNAME || !env.WORDPRESS_APP_PASSWORD) {
    throw new Error("WORDPRESS_USERNAME and WORDPRESS_APP_PASSWORD must be set for WordPress admin write support");
  }
}

function assertSanityConfig() {
  if (!env.SANITY_PROJECT_ID) throw new Error("SANITY_PROJECT_ID must be set when CMS_PROVIDER=sanity");
  if (!env.SANITY_DATASET) throw new Error("SANITY_DATASET must be set when CMS_PROVIDER=sanity");
  if (!env.SANITY_API_VERSION) throw new Error("SANITY_API_VERSION must be set when CMS_PROVIDER=sanity");
}

export function getCmsAdapter(): CmsAdapter {
  if (singleton) return singleton;

  const provider = env.CMS_PROVIDER;
  if (provider === "wordpress") {
    assertWordPressConfig();
    const adapter = new WordPressCmsAdapter();
    singleton = adapter;
    return adapter;
  }

  if (provider === "sanity") {
    assertSanityConfig();
    const adapter = new SanityCmsAdapter();
    singleton = adapter;
    return adapter;
  }

  const adapter = new NativeCmsAdapter();
  singleton = adapter;
  return adapter;
}

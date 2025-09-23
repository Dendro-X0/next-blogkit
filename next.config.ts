import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx"],
  async redirects() {
    return [
      {
        source: "/user",
        destination: "/profile",
        permanent: false,
      },
    ];
  },
};

// Link next-intl App Router request configuration
// See: https://next-intl.dev/docs/getting-started/app-router
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
export default withNextIntl(nextConfig);

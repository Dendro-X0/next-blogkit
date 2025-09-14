import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkToc from "remark-toc";

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkToc],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
          properties: {
            ariaHidden: true,
            tabIndex: -1,
            className: "hash-link",
          },
        },
      ],
    ],
  },
});

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
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
export default withNextIntl(withMDX(nextConfig));

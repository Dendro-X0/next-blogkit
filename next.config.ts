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

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(withMDX(nextConfig));

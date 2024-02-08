// @ts-expect-error no types
import remarkA11yEmoji from "@fec/remark-a11y-emoji";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ComponentProps } from "react";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";

import { useMDXComponents } from "@/features/post/hooks/use-mdx-components";
import { cn } from "@/lib/utils";

export function RenderMDX({
  children,
  className,
  ...props
}: ComponentProps<"div"> & { children: string }) {
  const components = useMDXComponents();

  return (
    <div
      className={cn("prose prose-lg dark:prose-invert", className)}
      {...props}
    >
      <MDXRemote
        source={children}
        options={{
          mdxOptions: {
            remarkPlugins: [
              remarkGfm,
              remarkFrontmatter,
              remarkA11yEmoji,
              [
                remarkToc,
                {
                  tight: true,
                  maxDepth: 5,
                },
              ],
            ],
            rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
          },
        }}
        components={components}
      />
    </div>
  );
}

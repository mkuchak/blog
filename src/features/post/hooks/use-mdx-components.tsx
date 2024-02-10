import { MDXComponents } from "mdx/types";
import { ComponentProps, ComponentType } from "react";

import { CodeMDX } from "@/features/post/components/code-mdx";
import { HrMDX } from "@/features/post/components/hr-mdx";
import { ImageMDX } from "@/features/post/components/image-mdx";
import { PreMDX } from "@/features/post/components/pre-mdx";
import { TableMDX } from "@/features/post/components/table-mdx";
import { TweetMDX } from "@/features/post/components/tweet-mdx";

export function useMDXComponents(
  components?: Partial<MDXComponents>
): MDXComponents {
  return {
    ...components,
    code: CodeMDX,
    hr: HrMDX,
    table: TableMDX,
    pre: PreMDX as ComponentType<ComponentProps<"pre">>,
    img: ImageMDX as ComponentType<ComponentProps<"img">>,
    Code: PreMDX,
    Image: ImageMDX,
    Tweet: TweetMDX,
  };
}

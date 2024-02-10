import slugify from "slugify";

import { getPosts, PostMetadata } from "@/features/post/api/get-posts";
import { parseMarkdown } from "@/lib/parse-markdown";

export async function useGetPost(slug: string) {
  const rawPosts = await getPosts();
  const posts = rawPosts.map((post) => {
    const { data, content } = parseMarkdown<PostMetadata>(post.body || "");
    data.slug = slugify(data.title, { lower: true, strict: true });

    return { data, content, ...post };
  });
  const post = posts.find((post) => post?.data.slug === slug);

  return post;
}

import slugify from "slugify";

import { getPosts, PostMetadata } from "@/features/post/api/get-posts";
import { parseMarkdown } from "@/lib/parse-markdown";

export async function useGetPosts() {
  const rawPosts = await getPosts();
  const posts = rawPosts.map((post) => {
    const { data, content } = parseMarkdown<PostMetadata>(post.body || "");
    data.slug = slugify(data.title, { lower: true, strict: true });

    return { data, content, ...post };
  });
  posts.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );

  return posts;
}

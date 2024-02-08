import { getPosts,PostMetadata } from "@/features/post/api/get-posts";
import { parseMarkdown } from "@/lib/parse-markdown";

export async function useGetPosts() {
  const rawPosts = await getPosts();
  const posts = rawPosts.map((post) => {
    const { data, content } = parseMarkdown<PostMetadata>(post.body || "");

    return { data, content, ...post };
  });

  return posts;
}

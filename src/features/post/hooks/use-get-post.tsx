import { PostMetadata, getPosts } from "@/features/post/api/get-posts";
import { parseMarkdown } from "@/lib/parse-markdown";

export async function useGetPost(slug: string) {
  const rawPosts = await getPosts();
  const posts = rawPosts.map((post) => {
    const { data, content } = parseMarkdown<PostMetadata>(post.body || "");

    return { data, content, ...post };
  });
  const post = posts.find((post) => post?.data.slug === slug);

  return post;
}

import matter from "gray-matter";

export function parseMarkdown<T = any>(markdown: string) {
  const { data, content } = matter(markdown) as unknown as {
    data: T;
    content: string;
  };

  return { data, content };
}

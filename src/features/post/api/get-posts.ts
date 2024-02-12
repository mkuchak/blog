import { github } from "@/constants/github";

export type QueryParameters = {
  state?: "open" | "closed" | "all";
  creator?: string;
  sort?: "created" | "updated" | "comments";
  direction?: "asc" | "desc";
  since?: string;
  per_page?: number;
  page?: number;
};

export type PostMetadata = {
  topic: string;
  title: string;
  slug: string;
  description: string;
  cover: string;
  date: Date;
  tags: string[];
};

export type Post = {
  data?: PostMetadata;
  content?: string;
  url: string;
  comments_url: string;
  id: number;
  node_id: string;
  number: number;
  title: string;
  user: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
  };
  state: string;
  locked: boolean;
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at?: null;
  author_association: string;
  body?: string | null;
  reactions: {
    total_count: number;
    "+1": number;
    laugh: number;
    hooray: number;
    heart: number;
    rocket: number;
    "-1": number;
    confused: number;
    eyes: number;
  };
};

export async function getPosts(queryParams?: QueryParameters): Promise<Post[]> {
  const defaultQueryParams = {
    state: "all",
    creator: github.owner,
    sort: "created",
    direction: "desc",
    per_page: 100,
    page: 1,
    ...queryParams,
  } as unknown as Record<string, string>;

  const url = new URL(
    `https://api.github.com/repos/${github.owner}/${github.repo}/issues`
  );
  url.search = new URLSearchParams(defaultQueryParams).toString();

  const response = await fetch(url.toString(), {
    headers: {
      accept: "application/vnd.github.raw+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    next: {
      revalidate: 60 * 5, // 5 minutes
    },
  });

  if (!response.ok) {
    console.error(response);
    throw new Error("Network response was not ok");
  }

  return await response.json();
}

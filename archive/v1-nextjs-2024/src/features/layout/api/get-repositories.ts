import { github } from "@/constants/github";

export type QueryParameters = {
  type?: "all" | "owner" | "member";
  sort?: "created" | "updated" | "pushed" | "full_name";
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
};

export type Repository = {
  id: number;
  name: string;
  html_url: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  stargazers_count: number;
  watchers_count: number;
  has_wiki: boolean;
  forks_count: number;
  topics?: (string | null)[] | null;
};

export async function getRepositories(
  queryParams?: QueryParameters
): Promise<Repository[]> {
  const defaultQueryParams = {
    type: "owner",
    sort: "updated",
    direction: "desc",
    per_page: 100,
    page: 1,
    ...queryParams,
  } as unknown as Record<string, string>;

  const url = new URL(`https://api.github.com/users/${github.owner}/repos`);
  url.search = new URLSearchParams(defaultQueryParams).toString();

  const response = await fetch(url.toString(), {
    headers: {
      accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    next: {
      revalidate: 60 * 60, // 1 hour
    },
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  return await response.json();
}

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

export const getRepositories = async ({ username }: { username: string }) => {
  const repositories: Repository[] = await (
    await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&direction=desc`,
      {
        next: {
          revalidate: 60 * 60, // 1 hour
        },
      }
    )
  ).json();

  /**
   * Get repositories based on the following criteria:
   * - Has no wiki
   * - Sort by stars
   * - Format name
   */
  const filteredRepositories = repositories
    .filter((repository) => !repository.has_wiki)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .map((repository) => ({
      ...repository,
      name: repository.name
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
    }));

  return filteredRepositories;
};

import { getRepositories } from "@/features/layout/api/get-repositories";

export async function useGetRepositories() {
  const rawRepositories = await getRepositories();
  const repositories = rawRepositories
    .filter((repository) => !repository.has_wiki)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .map((repository) => ({
      ...repository,
      name: repository.name
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
    }));

  return repositories;
}

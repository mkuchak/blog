"use client";

import { PropsWithChildren, useEffect } from "react";

import { useThemeAfterLoad } from "@/features/layout/hooks/use-theme-after-load";
import { Post } from "@/features/post/api/get-posts";
import { usePosts } from "@/features/post/stores/use-posts";

type ClientProviderProps = {
  data: {
    posts: Post[];
  };
};

export function ClientProvider({
  data: { posts },
  children,
}: PropsWithChildren<ClientProviderProps>) {
  const theme = useThemeAfterLoad();
  const { updatePosts } = usePosts();

  useEffect(() => updatePosts(posts), []);

  return <div data-theme={theme}>{children}</div>;
}

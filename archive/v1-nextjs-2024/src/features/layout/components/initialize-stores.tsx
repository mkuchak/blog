"use client";

import { useRef } from "react";

import { Post } from "@/features/post/api/get-posts";
import { usePosts } from "@/features/post/stores/use-posts";

type InitializeStoresProps = {
  data: {
    posts: Post[];
  };
};

export function InitializeStores({ data: { posts } }: InitializeStoresProps) {
  const initialized = useRef(false);
  const { updatePosts } = usePosts();

  if (!initialized.current) {
    updatePosts(posts);
    initialized.current = true;
  }

  return null;
}

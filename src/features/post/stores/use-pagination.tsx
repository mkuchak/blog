import { Post } from "@/features/post/api/get-posts";
import { create } from "zustand";

type PaginationStore = {
  posts: Post[];
  displayedPosts: Post[];
  hasMore: boolean;
  updatePosts: (posts: Post[]) => void;
  loadMore: () => void;
};

export const usePagination = create<PaginationStore>((set, get) => ({
  posts: [],
  displayedPosts: [],
  hasMore: true,
  updatePosts: (posts) => {
    set({ posts, displayedPosts: posts.slice(0, 6) });
  },
  loadMore: () => {
    const { posts, displayedPosts } = get();
    const loadMoreCount = 4;
    const newDisplayedPosts = displayedPosts.concat(
      posts.slice(displayedPosts.length, displayedPosts.length + loadMoreCount)
    );
    set({ displayedPosts: newDisplayedPosts });
    if (newDisplayedPosts.length === posts.length) {
      set({ hasMore: false });
    }
  },
}));

import { create } from "zustand";

import { Post } from "@/features/post/api/get-posts";

const INITIAL_POST_DISPLAY_COUNT = 6;
const LOAD_MORE_COUNT = 4;

const filterPostsBySearch = (allPosts: Post[], searchQuery: string): Post[] => {
  return allPosts.filter(
    (post) =>
      post.data?.title
        .toLowerCase()
        .includes(searchQuery.toLocaleLowerCase()) ||
      post.data?.description
        .toLowerCase()
        .includes(searchQuery.toLocaleLowerCase()) ||
      post.data?.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLocaleLowerCase())
      ) ||
      post.content?.toLowerCase().includes(searchQuery.toLocaleLowerCase())
  );
};

type PostsStore = {
  posts: Post[];
  updatePosts: (posts: Post[]) => void;
  searchedPosts: Post[];
  searchPosts: (query: string) => void;
  displayedPosts: Post[];
  filterPostsByTag: (tag: string) => void;
  resetDisplayedPosts: () => void;
  hasMore: boolean;
  loadMore: () => void;
};

export const usePosts = create<PostsStore>((set, get) => ({
  posts: [],
  updatePosts: (posts) => {
    set({
      posts,
      displayedPosts: posts.slice(0, INITIAL_POST_DISPLAY_COUNT),
    });
  },
  searchedPosts: [],
  searchPosts: (query) => {
    const { posts } = get();
    const filteredPosts = filterPostsBySearch(posts, query);
    set({ searchedPosts: filteredPosts });
  },
  displayedPosts: [],
  filterPostsByTag: (tag) => {
    const { posts } = get();
    const filteredPosts = posts.filter((post) =>
      post.data?.tags?.includes(tag)
    );
    set({ displayedPosts: filteredPosts });
  },
  resetDisplayedPosts: () => {
    const { posts } = get();
    set({
      displayedPosts: posts.slice(0, INITIAL_POST_DISPLAY_COUNT),
      hasMore: true,
    });
  },
  hasMore: true,
  loadMore: () => {
    const { posts, displayedPosts, hasMore } = get();
    if (!hasMore) return;
    const newDisplayedPosts = displayedPosts.concat(
      posts.slice(
        displayedPosts.length,
        displayedPosts.length + LOAD_MORE_COUNT
      )
    );
    set({ displayedPosts: newDisplayedPosts });
    if (newDisplayedPosts.length === posts.length) {
      set({ hasMore: false });
    }
  },
}));

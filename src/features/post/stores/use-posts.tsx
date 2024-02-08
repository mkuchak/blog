import { Post } from "@/features/post/api/get-posts";
import { create } from "zustand";

const INITIAL_POST_DISPLAY_COUNT = 6;
const LOAD_MORE_COUNT = 4;

const filterPostsBySearch = (allPosts: Post[], searchQuery: string): Post[] => {
  return allPosts.filter(
    (post) =>
      post.data?.title
        .toLowerCase()
        .includes(searchQuery.toLocaleLowerCase()) ||
      post.content?.toLowerCase().includes(searchQuery.toLocaleLowerCase())
  );
};

type PostsStore = {
  posts: Post[];
  searchedPosts: Post[];
  displayedPosts: Post[];
  hasMore: boolean;
  updatePosts: (posts: Post[]) => void;
  searchPosts: (query: string) => void;
  resetSearchResults: () => void;
  resetDisplayedPosts: () => void;
  loadMore: () => void;
};

export const usePosts = create<PostsStore>((set, get) => ({
  posts: [],
  searchedPosts: [],
  displayedPosts: [],
  hasMore: true,
  updatePosts: (posts) => {
    set({
      posts,
      displayedPosts: posts.slice(0, INITIAL_POST_DISPLAY_COUNT),
    });
  },
  searchPosts: (query) => {
    const { posts } = get();
    const filteredPosts = filterPostsBySearch(posts, query);
    set({ searchedPosts: filteredPosts });
  },
  resetSearchResults: () => {
    set({ searchedPosts: [] });
  },
  resetDisplayedPosts: () => {
    const { posts } = get();
    set({
      displayedPosts: posts.slice(0, INITIAL_POST_DISPLAY_COUNT),
      hasMore: true,
    });
  },
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

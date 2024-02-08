import { format } from "date-fns";
import { motion } from "framer-motion";
import { SearchIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { usePosts } from "@/features/post/stores/use-posts";

export function SearchBox({
  isOpen,
  toggleSearchBar,
}: {
  isOpen: boolean;
  toggleSearchBar: () => void;
}) {
  const [search, setSearch] = useState("");
  const { searchPosts, searchedPosts } = usePosts();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        toggleSearchBar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSearchBar]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex size-full items-start justify-center bg-black/10 pt-32 backdrop-blur-sm xs:pt-16"
      onClick={toggleSearchBar}
      onKeyDown={(e) => e.key === "Escape" && toggleSearchBar()}
    >
      <motion.div
        className="mx-4 flex w-full max-w-[540px] flex-col items-center justify-start rounded-lg bg-[#ffffff] shadow-lg dark:bg-[#1a1a1f]"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mx-4 flex h-[72px] w-full items-center justify-start space-x-4 rounded-t-lg p-6 shadow-md xxs:p-2">
          <label htmlFor="search" className="ml-2">
            <SearchIcon
              strokeWidth={3}
              className="size-5 text-[#1b202b] dark:text-[#f0f0f0]"
            />
          </label>
          <input
            id="search"
            className="!mr-4 size-full bg-transparent text-[1.25rem] font-medium text-[#1b202b] placeholder:text-[#1b202b] dark:text-[#f0f0f0] dark:placeholder:text-[#9ca3af] sm:!mr-0 xxs:text-[1.125rem]"
            placeholder="Search posts..."
            autoComplete="off"
            autoFocus
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              searchPosts(e.target.value);
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            className="!mr-1 hidden items-center justify-center hover:bg-transparent sm:flex"
            onClick={toggleSearchBar}
          >
            <XIcon
              strokeWidth={3}
              className="size-5 text-[#1b202b] dark:text-[#f0f0f0]"
            />
          </Button>
        </div>
        <div className="flex max-h-[32rem] w-full flex-col items-start overflow-auto last:rounded-b-lg xs:max-h-[28rem]">
          {search.length < 3 ? null : !searchedPosts.length &&
            search.length > 0 ? (
            <div className="flex h-[80px] w-full items-center border-t p-6">
              <h4 className="text-[1.125rem] font-medium text-[#252629] dark:text-[#f0f0f0] xxs:text-[1rem]">
                No results found...
              </h4>
            </div>
          ) : (
            searchedPosts.map((post) => (
              <Link
                href={`/post/${post.data?.slug}`}
                onClick={() => {
                  toggleSearchBar();
                  setSearch("");
                }}
                className="w-full"
                key={post.id}
              >
                <div className="flex w-full flex-col items-start justify-center border-t border-[#eaeaea] p-6 hover:bg-[#f3f1f3] dark:border-[#252629] dark:hover:bg-[#1f1f25] xxs:py-12">
                  <time className="text-[0.8125rem] text-[#51586a] dark:text-[#9e9e9e]">
                    {format(post.data?.date || Date.now(), "d MMMM, yyyy")}
                  </time>
                  <div className="line-clamp-2 text-[1.125rem] font-bold text-[#252629] dark:text-[#f0f0f0] xxs:text-[1rem]">
                    {post.data?.title}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { usePosts } from "@/features/post/stores/use-posts";
import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

export function LoadPostsButton({
  className,
  ...props
}: ComponentProps<typeof Button>) {
  const { loadMore, hasMore, posts } = usePosts();

  return (
    <Button
      variant="ghost"
      className={cn(
        "flex items-center justify-center text-base font-medium h-[3.75rem] px-9 rounded-full space-x-2",
        "text-[#ffffff] hover:text-[#ffffff] bg-[#1b202b] hover:bg-[#0056ff] dark:bg-[#6029ff] dark:hover:bg-[#4d21cb]",
        hasMore ? "visible" : "invisible",
        className
      )}
      onClick={() => loadMore()}
      disabled={posts.length === 0 || !hasMore}
      {...props}
    >
      Load more posts
    </Button>
  );
}

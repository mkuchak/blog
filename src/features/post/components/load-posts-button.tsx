"use client";

import { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { usePosts } from "@/features/post/stores/use-posts";
import { cn } from "@/lib/utils";

export function LoadPostsButton({
  className,
  ...props
}: ComponentProps<typeof Button>) {
  const { loadMore, hasMore, posts } = usePosts();

  return (
    <Button
      variant="ghost"
      className={cn(
        "flex h-[3.75rem] items-center justify-center space-x-2 rounded-full px-9 text-base font-medium",
        "bg-[#1b202b] text-[#ffffff] hover:bg-[#0056ff] hover:text-[#ffffff] dark:bg-[#6029ff] dark:hover:bg-[#4d21cb]",
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

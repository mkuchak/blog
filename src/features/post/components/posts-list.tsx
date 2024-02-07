"use client";

import { Button } from "@/components/ui/button";
import { Post } from "@/features/post/api/get-posts";
import { SpinLoader } from "@/features/post/components/spin-loader";
import { usePagination } from "@/features/post/stores/use-pagination";
import { format } from "date-fns";
import { MoveRightIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

type PostsListProps = {
  posts: Post[];
};

export function PostsList({ posts }: PostsListProps) {
  const { updatePosts, displayedPosts } = usePagination();

  useEffect(() => updatePosts(posts), []);

  if (displayedPosts.length === 0)
    return (
      <div className="container flex items-center justify-center">
        <SpinLoader />
      </div>
    );

  return (
    <div className="flex flex-col last:border-b border-[#eaeaea] dark:border-[#252629]">
      {displayedPosts.map((post, index) => {
        const readOrder = index + 1;

        return (
          <Link href={`/post/${post?.data?.slug}`} key={index}>
            <article className="hover:bg-[#f3f1f3] dark:hover:bg-[#1a1a1f] border-t border-[#eaeaea] dark:border-[#252629] py-14 lg:py-10 sm:py-8 group transition duration-500">
              <div className="container flex md:flex-col items-start justify-between">
                <time className="font-normal text-base text-[#51586a] dark:text-[#9e9e9e] leading-loose whitespace-nowrap">
                  {format(post?.data?.date || Date.now(), "d MMM, yyyy")}
                </time>

                <div className="flex flex-col w-3/5 lg:w-4/5 md:w-full overflow-hidden xl:ml-6 md:ml-0">
                  <div className="flex items-start justify-start space-x-3 md:space-x-0 mb-6">
                    <span className="font-normal text-base text-[#51586a] dark:text-[#9e9e9e] leading-loose md:hidden">
                      ({readOrder})
                    </span>
                    <h3 className="text-4xl lg:text-[2rem] md:text-[1.75rem] font-bold">
                      {post?.data?.title}
                    </h3>
                  </div>
                  <div className="flex space-x-2 ml-7 md:ml-0">
                    {post?.data?.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center justify-center space-x-3 py-2 px-[1.125rem] font-medium text-sm text-[#1b202b] dark:text-[#f0f0f0] bg-background hover:bg-[#f3f1f3] border border-[#eaeaea] dark:border-[#252629] rounded-full dark:hover:bg-[#1a1a1f] cursor-default hover:scale-105 transition duration-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  className="inline-flex items-center space-x-2 text-base bg-background hover:bg-background border border-[#eaeaea] dark:border-[#252629] rounded-full py-4 px-3 w-14 md:mt-6 lg:hidden"
                >
                  <MoveRightIcon
                    strokeWidth={3}
                    className="w-4 h-4 transition duration-300 group-hover:translate-x-1"
                  />
                </Button>
              </div>
            </article>
          </Link>
        );
      })}
    </div>
  );
}

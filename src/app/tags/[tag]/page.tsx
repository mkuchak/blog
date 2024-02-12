"use client";

import { format } from "date-fns";
import { MoveRightIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { usePosts } from "@/features/post/stores/use-posts";

export default function Tag({ params: { tag } }: { params: { tag: string } }) {
  const { filterPostsByTag, displayedPosts } = usePosts();
  const decodedTag = decodeURIComponent(tag);

  useEffect(() => filterPostsByTag(decodedTag), []);

  return (
    <>
      <section className="flex flex-col">
        <h2 className="container relative mb-6 text-[3.625rem] font-bold lg:text-[3rem] sm:text-3xl">
          <span>{decodedTag}</span>
          <span className="!absolute ml-1 size-6 rounded-full bg-[#f3f1f3] pt-1 text-center text-xs font-medium leading-4 text-[#1b202b] dark:bg-[#1a1a1f] dark:text-[#f0f0f0]">
            {displayedPosts.length}
          </span>
        </h2>
        <div className="flex flex-col">
          {displayedPosts.map((post, index) => {
            const readOrder = index + 1;

            return (
              <Link
                href={`/post/${post?.data?.slug}`}
                key={index}
                className="border-t border-[#eaeaea] last:border-b dark:border-[#252629]"
              >
                <article className="group py-14 transition duration-500 hover:bg-[#f3f1f3] dark:hover:bg-[#1a1a1f] lg:py-10 sm:py-8">
                  <div className="container flex items-start justify-between md:flex-col">
                    <time className="whitespace-nowrap text-base font-normal leading-loose text-[#51586a] dark:text-[#9e9e9e]">
                      {format(post?.data?.date || Date.now(), "d MMM, yyyy")}
                    </time>

                    <div className="flex w-3/5 flex-col overflow-hidden xl:ml-6 lg:w-4/5 md:ml-0 md:w-full">
                      <div className="mb-6 flex items-start justify-start space-x-3 md:space-x-0">
                        <span className="text-base font-normal leading-loose text-[#51586a] dark:text-[#9e9e9e] md:hidden">
                          ({readOrder})
                        </span>
                        <h3 className="text-4xl font-bold lg:text-[2rem] md:text-[1.75rem]">
                          {post?.data?.title}
                        </h3>
                      </div>
                      <div className="ml-7 flex flex-wrap gap-2 md:ml-0 sm:items-center sm:justify-start">
                        {post?.data?.tags.map((tag) => (
                          <Link
                            href={`/tags/${tag}`}
                            key={tag}
                            className="flex h-[2.375rem] items-center justify-center whitespace-nowrap rounded-full border border-[#eaeaea] bg-background px-[1.125rem] py-2 text-sm font-medium text-[#1b202b] transition duration-300 hover:scale-105 dark:border-[#252629] dark:text-[#f0f0f0]"
                          >
                            {tag}
                          </Link>
                        ))}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      className="inline-flex w-14 items-center space-x-2 rounded-full border border-[#eaeaea] bg-background px-3 py-4 text-base hover:bg-background dark:border-[#252629] lg:hidden md:mt-6"
                    >
                      <MoveRightIcon
                        strokeWidth={3}
                        className="size-4 transition duration-300 group-hover:translate-x-1"
                      />
                    </Button>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}

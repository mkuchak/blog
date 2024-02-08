import {
  MoveDownRightIcon,
  MoveRightIcon,
  MoveUpRightIcon,
} from "lucide-react";
import { Noto_Serif, Yellowtail } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { github } from "@/constants/github";
import { hero } from "@/constants/hero";
import { technologies } from "@/constants/technologies";
import { SocialBar } from "@/features/layout/components/social-bar";
import { useGetRepositories } from "@/features/layout/hooks/use-get-repositories";
import { useGetPosts } from "@/features/post/hooks/use-get-posts";
import { cn } from "@/lib/utils";

const yellowtail = Yellowtail({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const notoSerif = Noto_Serif({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default async function Home() {
  const posts = await useGetPosts();
  const repositories = await useGetRepositories();

  return (
    <>
      <section className="container flex lg:flex-col lg:space-y-10" id="home">
        <div className="flex w-3/5 flex-col lg:w-full">
          <span
            className={cn(
              yellowtail.className,
              "mb-2 -rotate-3 text-[2.5rem] leading-tight text-[#fdbc16] xl:text-4xl xl:leading-relaxed md:text-3xl"
            )}
          >
            {hero.presentation}
          </span>
          <h1 className="mb-6 text-[3.625rem] font-bold leading-tight xl:text-4xl">
            {hero.title}
          </h1>
          <p
            className={cn(
              notoSerif.className,
              "text-xl leading-relaxed text-[#51586a] dark:text-[#9e9e9e] xl:text-lg"
            )}
          >
            {hero.description}
          </p>
          <div className="mt-8">
            <SocialBar />
          </div>
        </div>
        <div className="flex w-2/5 items-center justify-center lg:w-full">
          <Image
            src={`https://github.com/${github.owner}.png`}
            alt={github.name}
            width={320}
            height={320}
            className="w-80 rounded-full lg:w-96 xs:w-72"
            priority={true}
          />
        </div>
      </section>

      <section className="flex flex-col">
        <h2 className="container mb-6 text-[2.5rem] font-bold xl:text-4xl md:text-3xl">
          Posts
        </h2>
        <div className="flex flex-col">
          {posts.slice(0, 6).map((post) => (
            <Link href={`/post/${post?.data.slug}`} key={post?.node_id}>
              <article className="border-t border-[#eaeaea] py-12 transition duration-500 hover:bg-[#f3f1f3] dark:border-[#252629] dark:hover:bg-[#1a1a1f]">
                <div className="container flex justify-between lg:flex-col-reverse">
                  <div className="flex w-1/2 max-w-[500px] flex-col justify-between lg:mt-8 lg:w-full">
                    <div>
                      <span
                        className={cn(
                          notoSerif.className,
                          "text-3xl leading-relaxed text-[#51586a] dark:text-[#9e9e9e] lg:text-[1.725rem] md:text-[1.5rem]"
                        )}
                      >
                        {post?.data.topic}
                      </span>
                      <h3 className="mb-6 mt-2 text-4xl font-bold lg:text-[2rem] md:text-[1.75rem]">
                        {post?.data.title}
                      </h3>
                      <p
                        className={cn(
                          notoSerif.className,
                          "text-lg leading-relaxed text-[#51586a] dark:text-[#9e9e9e] md:text-base"
                        )}
                      >
                        {post?.data.description}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      className="group inline-flex w-40 items-center space-x-2 rounded-full border border-[#eaeaea] bg-background px-4 py-5 text-base hover:bg-background dark:border-[#252629] lg:mt-6"
                    >
                      <span>Read Post</span>
                      <MoveRightIcon
                        strokeWidth={3}
                        className="size-4 transition duration-300 group-hover:translate-x-1"
                      />
                    </Button>
                  </div>
                  <div className="flex w-1/2 flex-col overflow-hidden xl:ml-6 lg:ml-0 lg:w-full">
                    <Image
                      src={post?.data.cover || "https://placehold.co/800x400"}
                      alt={post?.data.title || "Cover"}
                      width={800}
                      height={400}
                      className="rounded-3xl object-cover"
                      priority={true}
                    />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
        <Link href="/posts">
          <div className="group flex items-center justify-center border-y border-[#eaeaea] py-8 transition duration-500 hover:bg-[#f3f1f3] dark:border-[#252629] dark:hover:bg-[#1a1a1f] md:py-5">
            <div className="flex items-center space-x-2 text-xl font-medium">
              <span>View all</span>
              <MoveUpRightIcon
                strokeWidth={3}
                className="size-4 transition duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
              />
            </div>
          </div>
        </Link>
      </section>

      <section className="container flex flex-col" id="projects">
        <h2 className="mb-6 text-[2.5rem] font-bold xl:text-4xl md:text-3xl">
          See my projects
        </h2>
        <div className="grid grid-cols-3 justify-center gap-4 lg:grid-cols-2 md:grid-cols-1">
          {repositories.map((repository) => (
            <Link
              href={repository.html_url}
              target="_blank"
              key={repository.id}
            >
              <div className="group flex h-full flex-col rounded-3xl border border-[#eaeaea] p-8 shadow-md transition duration-500 hover:bg-[#f3f1f3] dark:border-[#252629] dark:hover:bg-[#1a1a1f]">
                <div className="flex items-center space-x-3 text-base">
                  <h3 className="text-xl font-bold">{repository.name}</h3>
                  <MoveRightIcon
                    strokeWidth={3}
                    className="size-6 transition duration-300 group-hover:translate-x-1"
                  />
                </div>
                <p
                  className={cn(
                    notoSerif.className,
                    "mt-2 text-base leading-relaxed text-[#51586a] dark:text-[#9e9e9e]"
                  )}
                >
                  {repository.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container flex flex-col">
        <h2 className="mb-6 flex items-center justify-center space-x-2 text-[2.5rem] font-bold xl:text-4xl xl:leading-relaxed lg:justify-start md:text-3xl">
          <MoveDownRightIcon strokeWidth={3} className="size-8" />
          <span>Some technologies I worked with</span>
        </h2>
        {Array(technologies.length)
          .fill(0)
          .map((_, index) => (
            <div
              className="mx-auto inline-flex w-full max-w-[1024px] flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_16px,_black_calc(100%-25px),transparent_100%)]"
              key={`container-${index}`}
            >
              {Array(2)
                .fill(0)
                .map((_, i) => (
                  <ul
                    className={cn(
                      "flex items-center justify-center py-1 md:justify-start [&_img]:max-w-none [&_li]:mx-1",
                      index % 2
                        ? "animate-infinite-scroll"
                        : "animate-infinite-scroll-reverse"
                    )}
                    key={`list-${i}-${index}`}
                  >
                    {technologies[index].map((technology) => (
                      <li
                        key={technology.name}
                        className="flex cursor-default items-center justify-center space-x-3 rounded-full border border-[#eaeaea] bg-background px-[1.125rem] py-[0.425rem] text-sm font-medium text-[#1b202b] transition duration-300 hover:scale-105 hover:bg-[#f3f1f3] dark:border-[#252629] dark:text-[#f0f0f0] dark:hover:bg-[#1a1a1f]"
                      >
                        {technology.image && (
                          <Image
                            src={technology.image}
                            alt={technology.name}
                            width={20}
                            height={20}
                            className="size-[1.25rem]"
                            priority={true}
                          />
                        )}
                        <span className="whitespace-nowrap">
                          {technology.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                ))}
            </div>
          ))}
      </section>
    </>
  );
}

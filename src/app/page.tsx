import { Button } from "@/components/ui/button";
import { github } from "@/constants/github";
import { hero } from "@/constants/hero";
import { projects } from "@/constants/projects";
import { technologies } from "@/constants/technologies";
import { SocialBar } from "@/features/layout/components/social-bar";
import { useGetPosts } from "@/features/post/hooks/use-get-posts";
import { cn } from "@/lib/utils";
import {
  MoveDownRightIcon,
  MoveRightIcon,
  MoveUpRightIcon,
} from "lucide-react";
import { Noto_Serif, Yellowtail } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

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

  return (
    <>
      <section className="container flex lg:flex-col lg:space-y-10" id="home">
        <div className="flex flex-col w-3/5 lg:w-full">
          <span
            className={cn(
              yellowtail.className,
              "text-[#fdbc16] text-[2.5rem] xl:text-4xl md:text-3xl -rotate-3 leading-tight xl:leading-relaxed mb-2"
            )}
          >
            {hero.presentation}
          </span>
          <h1 className="mb-6 text-[3.625rem] xl:text-4xl leading-tight font-bold">
            {hero.title}
          </h1>
          <p
            className={cn(
              notoSerif.className,
              "text-[#51586a] dark:text-[#9e9e9e] text-xl xl:text-lg leading-relaxed"
            )}
          >
            {hero.description}
          </p>
          <div className="mt-8">
            <SocialBar />
          </div>
        </div>
        <div className="flex w-2/5 lg:w-full items-center justify-center">
          <Image
            src={`https://github.com/${github.owner}.png`}
            alt={github.name}
            width={320}
            height={320}
            className="rounded-full w-80 lg:w-96 xs:w-72"
            priority={true}
          />
        </div>
      </section>

      <section className="flex flex-col">
        <h2 className="container font-bold text-[2.5rem] xl:text-4xl md:text-3xl mb-6">
          Posts
        </h2>
        <div className="flex flex-col">
          {posts.slice(0, 6).map((post) => (
            <Link href={`/post/${post?.data.slug}`} key={post?.node_id}>
              <article className="hover:bg-[#f3f1f3] dark:hover:bg-[#1a1a1f] border-t border-[#eaeaea] dark:border-[#252629] py-12 transition duration-500">
                <div className="container flex justify-between lg:flex-col-reverse">
                  <div className="flex flex-col w-1/2 lg:w-full max-w-[500px] justify-between lg:mt-8">
                    <div>
                      <span
                        className={cn(
                          notoSerif.className,
                          "text-[#51586a] dark:text-[#9e9e9e] text-3xl lg:text-[1.725rem] md:text-[1.5rem] leading-relaxed"
                        )}
                      >
                        {post?.data.topic}
                      </span>
                      <h3 className="text-4xl lg:text-[2rem] md:text-[1.75rem] font-bold mt-2 mb-6">
                        {post?.data.title}
                      </h3>
                      <p
                        className={cn(
                          notoSerif.className,
                          "text-[#51586a] dark:text-[#9e9e9e] text-lg md:text-base leading-relaxed"
                        )}
                      >
                        {post?.data.description}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      className="inline-flex items-center space-x-2 text-base bg-background hover:bg-background border border-[#eaeaea] dark:border-[#252629] rounded-full py-5 px-4 w-40 group lg:mt-6"
                    >
                      <span>Read Post</span>
                      <MoveRightIcon
                        strokeWidth={3}
                        className="w-4 h-4 transition duration-300 group-hover:translate-x-1"
                      />
                    </Button>
                  </div>
                  <div className="flex flex-col w-1/2 lg:w-full overflow-hidden xl:ml-6 lg:ml-0">
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
          <div className="flex items-center justify-center group border-t border-b border-[#eaeaea] dark:border-[#252629] py-8 md:py-5 transition duration-500 hover:bg-[#f3f1f3] dark:hover:bg-[#1a1a1f]">
            <div className="flex items-center text-xl font-medium space-x-2">
              <span>View all</span>
              <MoveUpRightIcon
                strokeWidth={3}
                className="w-4 h-4 transition duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </div>
          </div>
        </Link>
      </section>

      <section className="container flex flex-col" id="projects">
        <h2 className="font-bold text-[2.5rem] xl:text-4xl md:text-3xl mb-6">
          See my projects
        </h2>
        <div className="grid grid-cols-3 lg:grid-cols-2 md:grid-cols-1 gap-4 justify-center">
          {projects.map((project) => (
            <Link href={project.html_url} target="_blank" key={project.id}>
              <div className="flex flex-col h-full shadow-md rounded-3xl p-8 border border-[#eaeaea] hover:bg-[#f3f1f3] dark:border-[#252629] dark:hover:bg-[#1a1a1f] group transition duration-500">
                <div className="flex items-center space-x-3 text-base">
                  <h3 className="font-bold text-xl">{project.name}</h3>
                  <MoveRightIcon
                    strokeWidth={3}
                    className="w-6 h-6 transition duration-300 group-hover:translate-x-1"
                  />
                </div>
                <p
                  className={cn(
                    notoSerif.className,
                    "text-[#51586a] dark:text-[#9e9e9e] text-base leading-relaxed mt-2"
                  )}
                >
                  {project.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container flex flex-col">
        <h2 className="flex items-center justify-center lg:justify-start font-bold text-[2.5rem] xl:text-4xl md:text-3xl xl:leading-relaxed mb-6 space-x-2">
          <MoveDownRightIcon strokeWidth={3} className="w-8 h-8" />
          <span>Some technologies I worked with</span>
        </h2>
        {Array(technologies.length)
          .fill(0)
          .map((_, index) => (
            <div
              className="w-full inline-flex flex-nowrap overflow-hidden mx-auto max-w-[1024px] [mask-image:_linear-gradient(to_right,transparent_0,_black_16px,_black_calc(100%-25px),transparent_100%)]"
              key={`container-${index}`}
            >
              {Array(2)
                .fill(0)
                .map((_, i) => (
                  <ul
                    className={cn(
                      "flex items-center justify-center md:justify-start [&_li]:mx-1 [&_img]:max-w-none py-1",
                      index % 2
                        ? "animate-infinite-scroll"
                        : "animate-infinite-scroll-reverse"
                    )}
                    key={`list-${i}-${index}`}
                  >
                    {technologies[index].map((technology) => (
                      <li
                        key={technology.name}
                        className="flex items-center justify-center space-x-3 py-[0.425rem] px-[1.125rem] font-medium text-sm text-[#1b202b] dark:text-[#f0f0f0] bg-background hover:bg-[#f3f1f3] border border-[#eaeaea] dark:border-[#252629] rounded-full dark:hover:bg-[#1a1a1f] cursor-default hover:scale-105 transition duration-300"
                      >
                        {technology.image && (
                          <Image
                            src={technology.image}
                            alt={technology.name}
                            width={20}
                            height={20}
                            className="w-[1.25rem] h-[1.25rem]"
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

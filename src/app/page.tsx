import { owner } from "@/constants/owner";
import { hero } from "@/constants/hero";
import { projects } from "@/constants/projects";
import { PageContainer } from "@/features/layout/components/page-container";
import Image from "next/image";
import { Yellowtail, Noto_Serif } from "next/font/google";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { articles } from "@/constants/articles";
import Link from "next/link";
import {
  MoveDownRightIcon,
  MoveRightIcon,
  MoveUpRightIcon,
} from "lucide-react";
import { technologies } from "@/constants/technologies";
import { SocialBar } from "@/features/layout/components/social-bar";

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

export default function Home() {
  return (
    <PageContainer>
      <section className="container flex">
        <div className="flex flex-col w-3/5">
          <span
            className={cn(
              yellowtail.className,
              "text-[#fdbc16] text-[2.5rem] -rotate-3 leading-tight mb-2"
            )}
          >
            {hero.presentation}
          </span>
          <h1 className="mb-6 text-[3.625rem] leading-tight font-bold">
            {hero.title}
          </h1>
          <p
            className={cn(
              notoSerif.className,
              "text-[#51586a] dark:text-[#51586a] dark:text-[#9e9e9e] text-xl leading-relaxed"
            )}
          >
            {hero.description}
          </p>
          <div className="mt-8">
            <SocialBar />
          </div>
        </div>
        <div className="flex w-2/5 items-center justify-center">
          <Image
            src={`https://github.com/${owner.github}.png`}
            alt={owner.name}
            width={320}
            height={320}
            className="rounded-full w-80 h-80"
          />
        </div>
      </section>

      <section className="flex flex-col">
        <h2 className="container font-bold text-[2.5rem] mb-6">Posts</h2>
        <div className="flex flex-col">
          {articles.map((article) => (
            <Link href={`/blog/${article.slug}`} key={article.slug}>
              <article className="hover:bg-[#f3f1f3] dark:hover:bg-[#1a1a1f] border-t border-[#eaeaea] dark:border-[#252629] py-12 transition duration-500">
                <div className="container flex justify-between">
                  <div className="flex flex-col w-1/2 max-w-[500px] justify-between">
                    <div>
                      <span
                        className={cn(
                          notoSerif.className,
                          "text-[#51586a] dark:text-[#9e9e9e] text-3xl leading-relaxed"
                        )}
                      >
                        {article.topic}
                      </span>
                      <h3 className="text-4xl font-bold mt-2 mb-6">
                        {article.title}
                      </h3>
                      <p
                        className={cn(
                          notoSerif.className,
                          "text-[#51586a] dark:text-[#9e9e9e] text-lg leading-relaxed"
                        )}
                      >
                        {article.description}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      className="inline-flex items-center space-x-2 text-base bg-background hover:bg-background border border-[#eaeaea] dark:border-[#252629] rounded-full py-5 px-4 w-40 group"
                    >
                      <span>Read Post</span>
                      <MoveRightIcon
                        strokeWidth={3}
                        className="w-4 h-4 transition duration-300 group-hover:translate-x-1"
                      />
                    </Button>
                  </div>
                  <div className="flex flex-col w-1/2 overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      width={800}
                      height={400}
                      className="rounded-3xl object-cover"
                    />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
        <Link href="/blog">
          <div className="flex items-center justify-center group border-t border-b border-[#eaeaea] dark:border-[#252629] py-8 transition duration-500 hover:bg-[#f3f1f3] dark:hover:bg-[#1a1a1f]">
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

      <section className="container flex flex-col">
        <h2 className="font-bold text-[2.5rem] mb-6">See my projects</h2>
        <div className="grid grid-cols-3 gap-4 justify-center">
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

      <section className="container flex flex-col pb-20">
        <h2 className="flex items-center justify-center font-bold text-[2.5rem] mb-6 space-x-2">
          <MoveDownRightIcon strokeWidth={3} className="w-8 h-8" />
          <span>Just a few techs I&apos;ve worked with</span>
        </h2>
        <div className="flex items-center justify-center space-x-2 space-y-2 flex-wrap">
          {technologies.map((technology) => (
            <Button
              variant="ghost"
              className="font-medium text-sm text-[#1b202b] dark:text-[#f0f0f0] bg-background hover:bg-background border border-[#eaeaea] dark:border-[#252629] rounded-full py-2.5 px-5 hover:bg-[#f3f1f3] dark:hover:bg-[#1a1a1f] hover:scale-105 transition duration-300"
              key={technology.name}
            >
              {technology.image && (
                <Image
                  src={technology.image}
                  alt={technology.name}
                  width={20}
                  height={20}
                  className="w-4 h-4 mr-2"
                />
              )}
              {technology.name}
            </Button>
          ))}
        </div>
        <span className="flex items-center justify-center font-bold text-lg mt-8">
          And many more...
        </span>
      </section>
    </PageContainer>
  );
}

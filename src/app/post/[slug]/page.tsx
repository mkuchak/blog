import { format } from "date-fns";
import { Noto_Serif } from "next/font/google";
import Image from "next/image";
import { redirect } from "next/navigation";

import { RenderMDX } from "@/features/post/components/render-mdx";
import { useGetPost } from "@/features/post/hooks/use-get-post";
import { cn } from "@/lib/utils";

const notoSerif = Noto_Serif({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default async function Post({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const post = await useGetPost(slug);

  if (!post) {
    redirect("/not-found");
  }

  return (
    <>
      <section className="mx-auto -mt-8 max-w-[1280px]">
        <article className="flex flex-col items-center justify-center">
          <div className="article mb-14 sm:mb-6">
            <time className="text-base font-normal leading-loose text-[#51586a] dark:text-[#9e9e9e]">
              {format(post.data.date, "d MMMM, yyyy")}
            </time>
            <h1 className="mb-6 text-[3rem] font-bold leading-tight md:text-4xl xs:text-3xl">
              {post.data.title}
            </h1>
            <p
              className={cn(
                "mb-6 text-lg leading-normal text-[#51586a] dark:text-[#9e9e9e] sm:text-[1.125rem]",
                notoSerif.className
              )}
            >
              {post.data.description}
            </p>
            <div className="flex gap-2 md:ml-0 sm:flex-wrap sm:items-center sm:justify-start">
              {post.data.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex h-[2.375rem] cursor-default items-center justify-center whitespace-nowrap rounded-full border border-[#eaeaea] bg-background px-[1.125rem] py-2 text-sm font-medium text-[#1b202b] transition duration-300 hover:scale-105 hover:bg-[#f3f1f3] dark:border-[#252629] dark:text-[#f0f0f0] dark:hover:bg-[#1a1a1f]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="lg:article aspect-cinematic mx-4 flex items-center justify-center overflow-hidden rounded-3xl bg-cover lg:mx-0 lg:!px-0 md:!mx-4">
            <Image
              src={post.data.cover || "https://placehold.co/800x400"}
              alt={post.data.title || "Cover"}
              width={1280}
              height={720}
              className="object-fill"
              priority={true}
            />
          </div>

          <RenderMDX
            className={cn(
              "article mt-14 sm:mt-6",
              "prose-headings:font-sans",
              "prose-p:text-lg prose-p:leading-normal prose-p:sm:text-[1.125rem]",
              "prose-p:text-[#51586a] prose-p:dark:text-[#9e9e9e]",
              "prose-img:mx-auto prose-img:w-full prose-img:rounded-3xl",
              notoSerif.className
            )}
          >
            {post.content}
          </RenderMDX>
        </article>
      </section>
    </>
  );
}

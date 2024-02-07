import { RenderMDX } from "@/features/post/components/render-mdx";
import { useGetPost } from "@/features/post/hooks/use-get-post";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Noto_Serif } from "next/font/google";
import Image from "next/image";
import { redirect } from "next/navigation";

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
    redirect("/404");
  }

  return (
    <>
      <section className="max-w-[1280px] mx-auto -mt-8">
        <article className="flex flex-col justify-center items-center">
          <div className="article mb-14 sm:mb-6">
            <time className="font-normal text-base text-[#51586a] dark:text-[#9e9e9e] leading-loose">
              {format(post.data.date, "d MMMM, yyyy")}
            </time>
            <h1 className="mb-6 text-[3rem] md:text-4xl xs:text-3xl leading-tight font-bold">
              {post.data.title}
            </h1>
            <p
              className={cn(
                "mb-6 text-[#51586a] text-lg sm:text-[1.125rem] dark:text-[#9e9e9e] leading-normal",
                notoSerif.className
              )}
            >
              {post.data.description}
            </p>
            <div className="flex space-x-2">
              {post.data.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center justify-center space-x-3 py-2 px-[1.125rem] font-medium text-sm text-[#1b202b] dark:text-[#f0f0f0] bg-background hover:bg-[#f3f1f3] border border-[#eaeaea] dark:border-[#252629] rounded-full dark:hover:bg-[#1a1a1f] cursor-default hover:scale-105 transition duration-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="max-w-[1280px] lg:article px-4">
            <Image
              src={post.data.cover}
              alt={post.data.title}
              className="rounded-3xl"
              width={1280}
              height={720}
              priority={true}
            />
          </div>
          <RenderMDX
            className={cn(
              "article mt-14 sm:mt-6",
              "prose-headings:font-sans",
              "prose-p:text-lg prose-p:sm:text-[1.125rem] prose-p:leading-normal",
              "prose-p:text-[#51586a] prose-p:dark:text-[#9e9e9e]",
              "prose-img:rounded-3xl prose-img:mx-auto prose-img:w-full",
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

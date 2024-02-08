import { LoadPostsButton } from "@/features/post/components/load-posts-button";
import { PostsList } from "@/features/post/components/posts-list";

export default async function Posts() {
  return (
    <>
      <section className="flex flex-col">
        <h2 className="container mb-6 text-[4rem] font-bold lg:text-[3rem] sm:text-4xl">
          Posts
        </h2>
        <PostsList />
      </section>

      <section className="container !mt-16 flex items-center justify-center lg:!mb-6">
        <LoadPostsButton />
      </section>
    </>
  );
}

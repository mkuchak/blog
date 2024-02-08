import { LoadPostsButton } from "@/features/post/components/load-posts-button";
import { PostsList } from "@/features/post/components/posts-list";

export default async function Posts() {
  return (
    <>
      <section className="flex flex-col">
        <h2 className="container font-bold text-[4rem] lg:text-[3rem] sm:text-4xl mb-6">
          Posts
        </h2>
        <PostsList />
      </section>

      <section className="container flex justify-center items-center !mt-16 lg:!mb-6">
        <LoadPostsButton />
      </section>
    </>
  );
}

import { Footer } from "@/features/layout/components/footer";
import { Header } from "@/features/layout/components/header";
import { useGetPosts } from "@/features/post/hooks/use-get-posts";
import { ClientProvider } from "@/providers/client-provider";
import { PropsWithChildren } from "react";

export async function PageContainer({ children }: PropsWithChildren) {
  const posts = await useGetPosts();
  const data = {
    posts,
  };

  return (
    <>
      <ClientProvider data={data}>
        <Header />
        <main className="flex flex-col justify-between py-16 lg:py-2 space-y-24 lg:space-y-10">
          {children}
        </main>
        <Footer />
      </ClientProvider>
    </>
  );
}

import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { InitializeStores } from "@/features/layout/components/initialize-stores";
import { PageContainer } from "@/features/layout/components/page-container";
import { useGetPosts } from "@/features/post/hooks/use-get-posts";
import { cn } from "@/lib/utils";
import { RootProvider } from "@/providers/root-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "kuch.dev",
  description: "Personal blog to share projects and ideas",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const posts = await useGetPosts();
  const initialData = {
    posts,
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <InitializeStores data={initialData} />
        <RootProvider>
          <PageContainer>{children}</PageContainer>
        </RootProvider>
      </body>
    </html>
  );
}

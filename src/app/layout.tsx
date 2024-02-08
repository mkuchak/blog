import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import { PageContainer } from "@/features/layout/components/page-container";
import { RootProvider } from "@/providers/root-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "kuch.dev",
  description: "Personal blog to share projects and ideas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <RootProvider>
          <PageContainer>{children}</PageContainer>
        </RootProvider>
      </body>
    </html>
  );
}

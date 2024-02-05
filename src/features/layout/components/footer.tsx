"use client";

import { Button } from "@/components/ui/button";
import { SocialBar } from "@/features/layout/components/social-bar";
import { MoveUpIcon } from "lucide-react";
import Link from "next/link";

export const Footer = () => {
  const backToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-[#eaeaea] dark:border-[#252629]">
      <div className="container flex flex-col py-10 px-4 space-y-8">
        <div className="flex justify-between flex-wrap lg:space-y-4">
          <div className="lg:w-full">
            <Link href="/">
              <h1 className="text-[2rem] font-black">Kuchak</h1>
            </Link>
          </div>
          <SocialBar className="-ml-1" />
          <div className="flex items-center justify-end w-28 xs:hidden">
            <Button
              variant="ghost"
              className="rounded-full space-x-2 bg-[#f8f8f8] hover:bg-[#f3f1f3] dark:bg-[#1a1a1f] dark:hover:bg-[#17171b] py-3 px-5 group"
              onClick={backToTop}
            >
              <MoveUpIcon
                strokeWidth={3}
                className="w-6 h-6 transition duration-300 group-hover:-translate-y-2"
              />
            </Button>
          </div>
        </div>
        <div className="flex lg:flex-wrap justify-center lg:justify-start text-sm text-[#9e9e9e] lg:text-left">
          © {new Date().getFullYear()}&nbsp;
          <Link href="/">
            <span className="font-bold text-foreground">kuch.dev</span>.
          </Link>
          &nbsp;Explore, inspire, create.
        </div>
      </div>
    </footer>
  );
};

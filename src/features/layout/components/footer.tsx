"use client";

import { Button } from "@/components/ui/button";
import { footer } from "@/constants/footer";
import { SocialBar } from "@/features/layout/components/social-bar";
import { cn } from "@/lib/utils";
import { MoveUpIcon } from "lucide-react";
import { Yellowtail } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

const yellowtail = Yellowtail({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const Footer = () => {
  const backToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <section className="container flex flex-col pb-10 lg:pb-12 relative justify-center items-center lg:items-start mt-10 mb-20 lg:mt-6 lg:mb-8">
        <h3
          className={cn(
            yellowtail.className,
            "text-[#fdbc16] text-[2.5rem] xl:text-4xl -rotate-3 leading-tight xl:leading-relaxed mb-2 lg:mb-6 sm:mb-4 xs:mb-2 z-10 absolute lg:relative"
          )}
        >
          The art of creating
        </h3>
        <div className="grid justify-center grid-cols-6 lg:grid-cols-3 lg:gap-6 sm:gap-4 xs:gap-1 lg:px-1 xs:px-0">
          {footer.images.slice(0, 6).map((image, index) => (
            <div
              className={cn(
                "w-full rounded-3xl lg:rounded-2xl overflow-hidden lg:rotate-0",
                index % 2 ? "rotate-12" : "-rotate-12"
              )}
              key={`footer-${index}`}
            >
              <Image
                src={image}
                alt="programming"
                width={400}
                height={400}
                className="object-cover aspect-square"
                priority={true}
              />
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#eaeaea] dark:border-[#252629]">
        <div className="container flex flex-col py-10 px-4 space-y-8">
          <div className="flex justify-between flex-wrap lg:space-y-4">
            <div className="lg:w-full">
              <Link href="/" className="inline-flex">
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
            <Link href="/" className="inline-flex">
              <span className="font-bold text-foreground">kuch.dev</span>.
            </Link>
            &nbsp;Explore, inspire, create.
          </div>
        </div>
      </footer>
    </>
  );
};

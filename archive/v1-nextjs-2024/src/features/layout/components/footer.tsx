"use client";

import { MoveUpIcon } from "lucide-react";
import { Yellowtail } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { footer } from "@/constants/footer";
import { SocialBar } from "@/features/layout/components/social-bar";
import { cn } from "@/lib/utils";

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
      <div className="container mt-10 flex items-center justify-center space-x-4 lg:mt-14">
        <span className="size-1.5 rounded-full bg-[#1b202b] dark:bg-[#f0f0f0]" />
        <span className="size-1.5 rounded-full bg-[#1b202b] dark:bg-[#f0f0f0]" />
        <span className="size-1.5 rounded-full bg-[#1b202b] dark:bg-[#f0f0f0]" />
        <hr />
      </div>

      <section className="container relative mb-24 mt-28 flex flex-col items-center justify-center pb-10 lg:mb-8 lg:mt-6 lg:items-start lg:pb-12">
        <h3
          className={cn(
            yellowtail.className,
            "absolute z-10 mb-2 -rotate-3 text-[2.5rem] leading-tight text-[#fdbc16] xl:text-4xl xl:leading-relaxed lg:relative lg:mb-6 sm:mb-4 xs:mb-2"
          )}
        >
          The art of creating
        </h3>
        <div className="grid grid-cols-6 justify-center lg:grid-cols-3 lg:gap-6 lg:px-1 sm:gap-4 xs:gap-1 xs:px-0">
          {footer.images.slice(0, 6).map((image) => (
            <div
              className={cn(
                "w-full overflow-hidden rounded-3xl lg:rotate-0 lg:rounded-2xl",
                "odd:-rotate-12 even:rotate-12 odd:lg:-rotate-0 even:lg:rotate-0",
              )}
              key={image}
            >
              <Image
                src={image}
                alt="programming"
                width={400}
                height={400}
                className="aspect-square object-cover"
                priority={true}
              />
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#eaeaea] dark:border-[#252629]">
        <div className="container flex flex-col space-y-8 px-4 py-10">
          <div className="flex flex-wrap justify-between lg:space-y-4">
            <div className="lg:w-full">
              <Link href="/" className="inline-flex">
                <h1 className="text-[2rem] font-black">Kuchak</h1>
              </Link>
            </div>
            <SocialBar className="-ml-1" />
            <div className="flex w-28 items-center justify-end xs:hidden">
              <Button
                variant="ghost"
                className="group space-x-2 rounded-full bg-[#f8f8f8] px-5 py-3 hover:bg-[#f3f1f3] dark:bg-[#1a1a1f] dark:hover:bg-[#17171b]"
                onClick={backToTop}
              >
                <MoveUpIcon
                  strokeWidth={3}
                  className="size-6 transition duration-300 group-hover:-translate-y-2"
                />
              </Button>
            </div>
          </div>
          <div className="flex justify-center text-sm text-[#9e9e9e] lg:flex-wrap lg:justify-start lg:text-left">
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

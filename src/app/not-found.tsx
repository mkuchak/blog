import { Noto_Serif } from "next/font/google";
import Link from "next/link";

import { cn } from "@/lib/utils";

const notoSerif = Noto_Serif({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function NotFound() {
  return (
    <>
      <section className="flex lg:flex-col lg:space-y-10" id="home">
        <div className="container flex w-full max-w-[780px] flex-col md:max-w-[640px]">
          <h1 className="mb-6 text-[3.25rem] font-bold leading-tight md:text-4xl xs:text-3xl">
            404 Not Found
          </h1>
          <div className={cn("space-y-6", notoSerif.className)}>
            <p className="text-xl leading-relaxed text-[#51586a] dark:text-[#9e9e9e] lg:text-lg">
              Oops... Seems like you are lost. We can&apos;t find the page you
              are looking. Maybe you can try to go back to home and start again.
            </p>
            <p className="text-xl font-bold leading-relaxed underline lg:text-lg">
              <Link href="/">Go to Home</Link>
            </p>
          </div>
        </div>
      </section>
      <div className="container flex items-center justify-center space-x-4">
        <span className="size-1.5 rounded-full bg-[#1b202b] dark:bg-[#f0f0f0]" />
        <span className="size-1.5 rounded-full bg-[#1b202b] dark:bg-[#f0f0f0]" />
        <span className="size-1.5 rounded-full bg-[#1b202b] dark:bg-[#f0f0f0]" />
        <hr />
      </div>
    </>
  );
  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
      <Link href="/">Return Home</Link>
    </div>
  );
}

import { cn } from "@/lib/utils";
import { Noto_Serif } from "next/font/google";
import Link from "next/link";

const notoSerif = Noto_Serif({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function NotFound() {
  return (
    <>
      <section className="flex lg:flex-col lg:space-y-10" id="home">
        <div className="container max-w-[780px] md:max-w-[640px] flex flex-col w-full">
          <h1 className="mb-6 text-[3.25rem] md:text-4xl xs:text-3xl leading-tight font-bold">
            404 Not Found
          </h1>
          <div className={cn("space-y-6", notoSerif.className)}>
            <p className="text-[#51586a] dark:text-[#9e9e9e] text-xl lg:text-lg leading-relaxed">
              Oops... Seems like you are lost. We can&apos;t find the page you
              are looking. Maybe you can try to go back to home and start again.
            </p>
            <p className="font-bold text-xl lg:text-lg leading-relaxed underline">
              <Link href="/">Go to Home</Link>
            </p>
          </div>
        </div>
      </section>
      <div className="container flex justify-center items-center space-x-4">
        <span className="bg-[#1b202b] dark:bg-[#f0f0f0] rounded-full w-1.5 h-1.5" />
        <span className="bg-[#1b202b] dark:bg-[#f0f0f0] rounded-full w-1.5 h-1.5" />
        <span className="bg-[#1b202b] dark:bg-[#f0f0f0] rounded-full w-1.5 h-1.5" />
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

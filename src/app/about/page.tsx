import { Noto_Serif } from "next/font/google";

import { cn } from "@/lib/utils";

const notoSerif = Noto_Serif({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function About() {
  return (
    <>
      <section className="flex lg:flex-col lg:space-y-10" id="home">
        <div className="container flex w-full max-w-[780px] flex-col md:max-w-[640px]">
          <h1 className="mb-6 text-[3.25rem] font-bold leading-tight md:text-4xl xs:text-3xl">
            About Me
          </h1>
          <div className="space-y-6">
            <p
              className={cn(
                notoSerif.className,
                "text-xl leading-relaxed text-[#51586a] dark:text-[#9e9e9e] lg:text-lg"
              )}
            >
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dicta
              eligendi aut a beatae architecto. Corporis id quia quae expedita!
              Error sequi tenetur, molestiae quia rerum aut ullam sint minima
              sunt? Lorem ipsum dolor, sit amet consectetur adipisicing elit.
              Dicta eligendi aut a beatae architecto. Corporis id quia quae
              expedita! Error sequi tenetur, molestiae quia rerum aut ullam sint
              minima sunt?
            </p>
            <p
              className={cn(
                notoSerif.className,
                "text-xl leading-relaxed text-[#51586a] dark:text-[#9e9e9e] lg:text-lg"
              )}
            >
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dicta
              eligendi aut a beatae architecto. Corporis id quia quae expedita!
              Error sequi tenetur, molestiae quia rerum aut ullam sint minima
              sunt? Lorem ipsum dolor, sit amet consectetur adipisicing elit.
              Dicta eligendi aut a beatae architecto. Corporis id quia quae
              expedita! Error sequi tenetur, molestiae quia rerum aut ullam sint
              minima sunt?
            </p>
            <h2 className="text-[1.75rem] font-bold md:text-lg">
              Skills and Collaborative Tools
            </h2>
            <p
              className={cn(
                notoSerif.className,
                "text-xl leading-relaxed text-[#51586a] dark:text-[#9e9e9e] lg:text-lg"
              )}
            >
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dicta
              eligendi aut a beatae architecto. Corporis id quia quae expedita!
              Error sequi tenetur, molestiae quia rerum aut ullam sint minima
              sunt? Lorem ipsum dolor, sit amet consectetur adipisicing elit.
              Dicta eligendi aut a beatae architecto. Corporis id quia quae
              expedita! Error sequi tenetur, molestiae quia rerum aut ullam sint
              minima sunt?
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

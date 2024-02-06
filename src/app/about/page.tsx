import { cn } from "@/lib/utils";
import { Noto_Serif } from "next/font/google";

const notoSerif = Noto_Serif({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function AboutMe() {
  return (
    <>
      <section className="flex lg:flex-col lg:space-y-10" id="home">
        <div className="container max-w-[780px] flex flex-col w-full">
          <h1 className="mb-6 text-[3.25rem] md:text-4xl xs:text-3xl leading-tight font-bold">
            About Me
          </h1>
          <div className="space-y-6">
            <p
              className={cn(
                notoSerif.className,
                "text-[#51586a] dark:text-[#9e9e9e] text-xl lg:text-lg leading-relaxed"
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
                "text-[#51586a] dark:text-[#9e9e9e] text-xl lg:text-lg leading-relaxed"
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
            <h2 className="font-bold text-[1.75rem] md:text-lg">
              Skills and Collaborative Tools
            </h2>
            <p
              className={cn(
                notoSerif.className,
                "text-[#51586a] dark:text-[#9e9e9e] text-xl lg:text-lg leading-relaxed"
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
      <div className="container flex justify-center items-center space-x-4">
        <span className="bg-[#1b202b] dark:bg-[#f0f0f0] rounded-full w-1.5 h-1.5" />
        <span className="bg-[#1b202b] dark:bg-[#f0f0f0] rounded-full w-1.5 h-1.5" />
        <span className="bg-[#1b202b] dark:bg-[#f0f0f0] rounded-full w-1.5 h-1.5" />
        <hr />
      </div>
    </>
  );
}

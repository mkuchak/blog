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
              As a seasoned full-stack web developer, I&apos;ve been deeply
              entrenched in both front-end and back-end development throughout
              my career. However, I&apos;ve recently honed in on the front-end
              domain, driven by the allure of cutting-edge technologies such as
              headless architecture, serverless computing, and edge computing.
              With a robust foundation in Software Engineering and a
              Bachelor&apos;s degree in Computer Science, I bring a wealth of
              experience to the forefront.
            </p>
            <p
              className={cn(
                notoSerif.className,
                "text-xl leading-relaxed text-[#51586a] dark:text-[#9e9e9e] lg:text-lg"
              )}
            >
              My approach is deeply rooted in user-centric design, constantly
              striving to enhance the user experience and drive impressive
              retention and conversion rates. Leveraging data-metrics and A/B
              testing methodologies, I continuously refine and optimize
              interfaces to ensure optimal performance. I thrive on the cutting
              edge, eagerly embracing modern technologies that not only
              streamline development processes but also yield exceptional
              productivity gains
            </p>
            <p
              className={cn(
                notoSerif.className,
                "text-xl leading-relaxed text-[#51586a] dark:text-[#9e9e9e] lg:text-lg"
              )}
            >
              If you have any questions or would like to chat, please feel to
              engage with me on social media or send me an email. I&apos;m
              always open to new opportunities and collaborations.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

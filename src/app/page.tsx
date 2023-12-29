import { CalendarIcon, ClockIcon } from "lucide-react";
import Image from "next/image";
import { SocialIcon } from "~/components/social/social-icon";
import { Button } from "~/components/ui/button";
import { socialNetworks } from "~/constants/social-networks";

export default function Home() {
  return (
    <main className="container flex min-h-screen flex-col items-center justify-between p-24 space-y-24">
      <section className="flex items-center justify-center space-x-8">
        <Image
          src="https://github.com/mkuchak.png"
          alt="Marcos"
          width={256}
          height={256}
          className="rounded-full"
        />
        <div className="flex flex-col space-y-6">
          <div className="space-y-2">
            <span className="text-xl">Hello, I&apos;m</span>
            <h1 className="font-bold text-4xl">Marcos Kuchak</h1>
          </div>
          <p className="">
            Full-stack developer since &apos;09, with expertise extending far
            beyond Node.js and React, I bring a wealth of knowledge to craft
            digital masterpieces for a revolutionary cross-platform web
            development journey.
          </p>
          <div className="flex space-x-2">
            {socialNetworks.map((social) => (
              <Button variant="outline" size="icon" key={social.name} asChild>
                <a href={social.url} target="_blank" rel="noreferrer">
                  <SocialIcon
                    name={social.icon}
                    className="fill-current w-5 h-5"
                  />
                </a>
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col space-y-6">
        <h2 className="text-center font-bold text-4xl pb-10">Recent posts</h2>

        <div className="flex flex-col space-y-16">
          {Array(10)
            .fill(0)
            .map(() => (
              <div
                className="max-w-[64rem] flex items-center space-x-10"
                key={Math.random()}
              >
                <div className="relative w-[48rem] h-[16rem] bg-gray-200 rounded-md">
                  <Image
                    src="/posts/clean-architecture/cover.png"
                    alt="Clean Architecture"
                    layout="fill"
                    className="object-cover rounded-md shadow-md border-2 border-gray-200"
                  />
                </div>

                <div className="flex flex-col space-y-2 justify-between w-[54rem] h-[14rem]">
                  <div className="flex items-center space-x-3 text-base">
                    <div className="flex space-x-2 text-gray-400 items-center">
                      <CalendarIcon className="w-4 h-4" />
                      <span>May 1, 2021</span>
                    </div>
                    <div className="flex w-[0.175rem] h-[0.175rem] bg-gray-400 rounded-full" />
                    <div className="flex space-x-2 text-gray-400 items-center">
                      <ClockIcon className="w-4 h-4" />
                      <span>5 min read</span>
                    </div>
                  </div>

                  <h2 className="font-semibold text-3xl line-clamp-2">
                    A complete explanation about the Clean Architecture for
                    Node.js using TypeScript
                  </h2>

                  <p className="text-gray-600 dark:text-gray-500 line-clamp-2 text-muted-foreground">
                    The Clean Architecture is a practical software architecture
                    intended to make it easier to develop software by following
                    software design principles, such as SOLID principles and
                    Domain-driven design. The goal of Clean Architecture is to
                    separate concerns of software components (e.g. classes) into
                    different layers of abstraction.
                  </p>

                  <div className="flex space-x-2 pt-1">
                    <Button variant="outline" asChild>
                      <a href="/blog/clean-architecture">Read</a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="/blog/clean-architecture">Share</a>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>
    </main>
  );
}

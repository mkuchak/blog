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
            <span className="text-2xl">Hello, I&apos;m</span>
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
    </main>
  );
}

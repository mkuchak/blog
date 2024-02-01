import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";
import Link from "next/link";

export const Header = () => {
  return (
    <header>
      <div className="container flex py-10 px-4 space-x-20">
        <Link href="/">
          <div className="flex items-center space-x-3">
            <h1 className="text-[2rem] font-black">Kuchak</h1>
          </div>
        </Link>
        <nav className="flex justify-between w-full">
          <ul className="flex items-center space-x-9">
            <Link href="/">
              <li className="py-3 text-base font-medium hover:text-[#fdbc16] transition">
                Home
              </li>
            </Link>
            <Link href="#projects">
              <li className="py-3 text-base font-medium hover:text-[#fdbc16] transition">
                Projects
              </li>
            </Link>
            <Link href="#about">
              <li className="py-3 text-base font-medium hover:text-[#fdbc16] transition">
                About
              </li>
            </Link>
          </ul>
          <ul className="flex items-center space-x-2">
            <Button
              variant="ghost"
              className="rounded-full space-x-2 bg-[#f3f1f3] dark:bg-[#1a1a1f] hover:bg-[#e7e7eb] dark:hover:bg-[#1f1f25] py-5 px-5"
            >
              <SearchIcon strokeWidth={3} className="w-4 h-4" />
              <span className="py-3 text-base font-medium">Search</span>
            </Button>
            <Button
              variant="ghost"
              className="rounded-full space-x-2 text-[#ffffff] hover:text-[#ffffff] bg-[#1b202b] hover:bg-[#0056ff] dark:bg-[#6029ff] dark:hover:bg-[#4d21cb] py-5 px-5"
              asChild
            >
              <Link href="/contact">
                <li className="py-3 text-base font-medium">Get in touch</li>
              </Link>
            </Button>
            <ThemeToggle />
          </ul>
        </nav>
      </div>
    </header>
  );
};

"use client";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { SearchBox } from "@/features/layout/components/search-box";
import { useModalController } from "@/features/layout/hooks/use-modal-controller";
import { useOutsideClick } from "@/features/layout/hooks/use-outside-click";
import { cn } from "@/lib/utils";
import { MenuIcon, SearchIcon, XIcon } from "lucide-react";
import Link from "next/link";

export const Header = () => {
  const [isMenuOpen, toggleMenu] = useModalController();
  const [isSearchBoxOpen, toggleSearchBox] = useModalController(() => {
    toggleMenu("close");
    if (isSearchBoxOpen) {
      document.body.style.overflow = "auto";
    } else {
      document.body.style.overflow = "hidden";
    }
  });
  const ref = useOutsideClick(() => toggleMenu("close"));

  return (
    <>
      <header>
        <div className="container flex items-center py-10 space-x-20 lg:space-x-0 lg:justify-between lg:relative">
          <Link href="/">
            <div className="flex items-center space-x-3">
              <h1 className="text-[2rem] font-black">Kuchak</h1>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="items-center justify-end hover:bg-transparent hidden lg:flex focus-visible:ring-0"
            onClick={() => toggleMenu()}
          >
            {!isMenuOpen ? (
              <MenuIcon strokeWidth={3} className="w-7 h-7" />
            ) : (
              <XIcon strokeWidth={3} className="w-7 h-7" />
            )}
          </Button>
          <nav
            ref={ref}
            className={cn(
              isMenuOpen ? "flex" : "flex lg:hidden",
              "justify-between w-full lg:flex-col lg:justify-end lg:items-end lg:space-y-2",
              "lg:dark:bg-[#1a1a1f]/50 lg:border lg:dark:border-[#252629] lg:bg-[#f3f1f3]/25 lg:border-[#e7e7eb]",
              "lg:rounded-3xl lg:p-4 lg:w-48 lg:absolute lg:top-[5.25rem] lg:right-5 lg:z-10",
              "lg:transition-all lg:duration-300 lg:ease-in-out lg:backdrop-blur-xl"
            )}
          >
            <ul className="flex items-center space-x-9 lg:space-x-0 lg:flex-col">
              <Link href="/#home" onClick={() => toggleMenu("close")}>
                <li className="py-3 text-base font-medium hover:text-[#fdbc16] transition lg:py-2">
                  Home
                </li>
              </Link>
              <Link href="#projects" onClick={() => toggleMenu("close")}>
                <li className="py-3 text-base font-medium hover:text-[#fdbc16] transition lg:py-2">
                  Projects
                </li>
              </Link>
              <Link href="/about" onClick={() => toggleMenu("close")}>
                <li className="py-3 text-base font-medium hover:text-[#fdbc16] transition lg:py-2">
                  About
                </li>
              </Link>
            </ul>
            <ul className="flex items-center space-x-2 lg:flex-col lg:justify-end lg:items-end lg:space-x-0 lg:space-y-2.5">
              <Button
                variant="ghost"
                className="rounded-full space-x-2 bg-[#f3f1f3] dark:bg-[#1a1a1f] dark:lg:bg-[#252629] hover:bg-[#e7e7eb] dark:hover:bg-[#1f1f25] h-10 px-5 lg:px-4 flex items-center justify-center"
                onClick={() => toggleSearchBox()}
              >
                <SearchIcon strokeWidth={3} className="w-4 h-4" />
                <span className="py-3 text-base font-medium">Search</span>
              </Button>
              <Link href="/contact" onClick={() => toggleMenu("close")}>
                <li className="rounded-full space-x-2 text-[#ffffff] hover:text-[#ffffff] bg-[#1b202b] hover:bg-[#0056ff] dark:bg-[#6029ff] dark:hover:bg-[#4d21cb] h-10 px-5 lg:px-4 text-base font-medium flex items-center justify-center">
                  Get in touch
                </li>
              </Link>
              <ThemeToggle />
            </ul>
          </nav>
        </div>
      </header>
      <SearchBox
        isOpen={isSearchBoxOpen}
        toggleSearchBar={() => toggleSearchBox()}
      />
    </>
  );
};

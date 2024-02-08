"use client";

import { isMobile } from "is-mobile";
import { MenuIcon, SearchIcon, XIcon } from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { SearchBox } from "@/features/layout/components/search-box";
import { useModalController } from "@/features/layout/hooks/use-modal-controller";
import { useOutsideClick } from "@/features/layout/hooks/use-outside-click";
import { cn } from "@/lib/utils";

export const Header = () => {
  const [isMenuOpen, toggleMenu] = useModalController();
  const closeMenu = () => toggleMenu("close");
  const onToggleSearchBox = () => {
    closeMenu();
    if (isSearchBoxOpen) {
      document.body.style.overflow = "auto";
      document.body.style.marginRight = "0";
    } else {
      document.body.style.overflow = "hidden";
      if (!isMobile()) document.body.style.marginRight = `16px`;
    }
  };
  const [isSearchBoxOpen, toggleSearchBox] =
    useModalController(onToggleSearchBox);
  const ref = useOutsideClick(closeMenu);

  return (
    <header>
      <div className="container flex items-center space-x-20 py-10 lg:relative lg:justify-between lg:space-x-0">
        <Link href="/">
          <div className="flex items-center space-x-3">
            <h1 className="text-[2rem] font-black">Kuchak</h1>
          </div>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="hidden items-center justify-end hover:bg-transparent focus-visible:ring-0 lg:flex"
          onClick={() => toggleMenu()}
        >
          {!isMenuOpen ? (
            <MenuIcon strokeWidth={3} className="size-7" />
          ) : (
            <XIcon strokeWidth={3} className="size-7" />
          )}
        </Button>
        <nav
          ref={ref}
          className={cn(
            isMenuOpen ? "flex" : "flex lg:hidden",
            "w-full justify-between lg:flex-col lg:items-end lg:justify-end lg:space-y-2",
            "lg:border lg:border-[#e7e7eb] lg:bg-[#f3f1f3]/25 lg:dark:border-[#252629] lg:dark:bg-[#1a1a1f]/50",
            "lg:absolute lg:right-5 lg:top-[5.25rem] lg:z-10 lg:w-48 lg:rounded-3xl lg:p-4",
            "lg:backdrop-blur-xl lg:transition-all lg:duration-300 lg:ease-in-out"
          )}
        >
          <ul className="flex items-center space-x-9 lg:flex-col lg:space-x-0">
            <Link href="/" onClick={() => toggleMenu("close")}>
              <li className="py-3 text-base font-medium transition hover:text-[#fdbc16] lg:py-2">
                Home
              </li>
            </Link>
            <Link href="/#projects" onClick={() => toggleMenu("close")}>
              <li className="py-3 text-base font-medium transition hover:text-[#fdbc16] lg:py-2">
                Projects
              </li>
            </Link>
            <Link href="/about" onClick={() => toggleMenu("close")}>
              <li className="py-3 text-base font-medium transition hover:text-[#fdbc16] lg:py-2">
                About
              </li>
            </Link>
          </ul>
          <ul className="flex items-center space-x-2 lg:flex-col lg:items-end lg:justify-end lg:space-x-0 lg:space-y-2.5">
            <Button
              variant="ghost"
              className="flex h-10 items-center justify-center space-x-2 rounded-full bg-[#f3f1f3] px-5 hover:bg-[#e7e7eb] dark:bg-[#1a1a1f] dark:hover:bg-[#1f1f25] lg:px-4 dark:lg:bg-[#252629]"
              onClick={() => toggleSearchBox()}
            >
              <SearchIcon strokeWidth={3} className="size-4" />
              <span className="py-3 text-base font-medium">Search</span>
            </Button>
            <Link href="/contact" onClick={() => toggleMenu("close")}>
              <li className="flex h-10 items-center justify-center space-x-2 rounded-full bg-[#1b202b] px-5 text-base font-medium text-[#ffffff] hover:bg-[#0056ff] hover:text-[#ffffff] dark:bg-[#6029ff] dark:hover:bg-[#4d21cb] lg:px-4">
                Get in touch
              </li>
            </Link>
            <ThemeToggle />
          </ul>
        </nav>
      </div>
      <SearchBox
        isOpen={isSearchBoxOpen}
        toggleSearchBar={() => toggleSearchBox()}
      />
    </header>
  );
};

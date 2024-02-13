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
            <li>
              <Button variant="link" asChild>
                <Link href="/" onClick={() => toggleMenu("close")}>
                  Home
                </Link>
              </Button>
            </li>
            <li>
              <Button variant="link" asChild>
                <Link href="/#projects" onClick={() => toggleMenu("close")}>
                  Projects
                </Link>
              </Button>
            </li>
            <li>
              <Button variant="link" asChild>
                <Link href="/about" onClick={() => toggleMenu("close")}>
                  About
                </Link>
              </Button>
            </li>
          </ul>
          <ul className="flex items-center space-x-2 lg:flex-col lg:items-end lg:justify-end lg:space-x-0 lg:space-y-2.5">
            <li>
              <Button
                variant="primary"
                className=""
                onClick={() => toggleSearchBox()}
              >
                <SearchIcon strokeWidth={3} className="size-4" />
                <span className="py-3 text-base font-medium">Search</span>
              </Button>
            </li>
            <li>
              <Button variant="secondary" asChild>
                <Link
                  href="mailto:hi@kuch.dev"
                  onClick={() => toggleMenu("close")}
                >
                  Get in touch
                </Link>
              </Button>
            </li>
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

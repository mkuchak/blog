"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === "light" ? "dark" : "light";
    setTheme(nextTheme);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="flex size-10 items-center justify-center rounded-full bg-[#f3f1f3] hover:bg-[#e7e7eb] dark:bg-[#1a1a1f] dark:hover:bg-[#1f1f25] dark:lg:bg-[#252629]"
    >
      <SunIcon className="block size-6 text-[#1a1a1f] dark:hidden" />
      <MoonIcon className="hidden size-6 text-[#f3f1f2] dark:block" />
    </Button>
  );
}

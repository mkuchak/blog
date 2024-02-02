"use client";

import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "lucide-react";

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
      className="flex items-center justify-center h-10 w-10 rounded-full bg-[#f3f1f3] dark:bg-[#1a1a1f] dark:lg:bg-[#252629] hover:bg-[#e7e7eb] dark:hover:bg-[#1f1f25]"
    >
      <SunIcon className="text-[#1a1a1f] h-6 w-6 block dark:hidden" />
      <MoonIcon className="text-[#f3f1f2] h-6 w-6 hidden dark:block" />
    </Button>
  );
}

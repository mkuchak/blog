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
    <Button variant="primary" size="icon" onClick={toggleTheme}>
      <SunIcon className="block size-6 text-[#1a1a1f] dark:hidden" />
      <MoonIcon className="hidden size-6 text-[#f3f1f2] dark:block" />
    </Button>
  );
}

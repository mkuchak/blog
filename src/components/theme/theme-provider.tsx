"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useTheme } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { PropsWithChildren } from "react";
import * as React from "react";
import { useEffect, useState } from "react";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <InitializeThemeOnClient>{children}</InitializeThemeOnClient>
    </NextThemesProvider>
  );
}

/**
 * Some components need to have data-theme attribute to define the theme on
 * client, like PreMDX that renders markdown content for code blocks.
 */
function InitializeThemeOnClient({ children }: PropsWithChildren) {
  const { resolvedTheme } = useTheme();
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const storedTheme =
      localStorage.getItem("theme") || resolvedTheme || "light";
    setTheme(storedTheme);
  }, [resolvedTheme]);

  return <div data-theme={theme}>{children}</div>;
}

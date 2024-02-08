"use client";

import { PropsWithChildren } from "react";

import { ThemeProvider } from "@/components/theme/theme-provider";

export function RootProvider({ children }: PropsWithChildren) {
  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </>
  );
}

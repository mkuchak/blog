"use client";

import NextTopLoader from "nextjs-toploader";
import { PropsWithChildren } from "react";

import { ThemeProvider } from "@/components/theme/theme-provider";

export function RootProvider({ children }: PropsWithChildren) {
  return (
    <>
      <NextTopLoader color="#fdbc16" height={3} showSpinner={false} />
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

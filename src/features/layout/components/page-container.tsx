"use client";

import { Footer } from "@/features/layout/components/footer";
import { Header } from "@/features/layout/components/header";
import { useThemeAfterLoad } from "@/features/layout/hooks/use-theme-after-load";
import { PropsWithChildren, useEffect, useState } from "react";

export function PageContainer({ children }: PropsWithChildren) {
  const theme = useThemeAfterLoad();

  return (
    <>
      <Header />
      <main
        className="flex flex-col justify-between py-16 lg:py-2 space-y-24 lg:space-y-10"
        data-theme={theme}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}

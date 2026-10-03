import { PropsWithChildren } from "react";

import { Footer } from "@/features/layout/components/footer";
import { Header } from "@/features/layout/components/header";

export async function PageContainer({ children }: PropsWithChildren) {
  return (
    <>
      <Header />
      <main className="flex flex-col justify-between space-y-24 py-16 lg:space-y-10 lg:py-2">
        {children}
      </main>
      <Footer />
    </>
  );
}

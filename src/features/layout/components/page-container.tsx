import { Footer } from "@/features/layout/components/footer";
import { Header } from "@/features/layout/components/header";
import { PropsWithChildren } from "react";

export function PageContainer({ children }: PropsWithChildren) {
  return (
    <>
      <Header />
      <main className="flex flex-col justify-between py-14 lg:py-2 space-y-24 lg:space-y-10">
        {children}
      </main>
      <Footer />
    </>
  );
}

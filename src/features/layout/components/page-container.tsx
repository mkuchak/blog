import { Footer } from "@/features/layout/components/footer";
import { Header } from "@/features/layout/components/header";
import { PropsWithChildren } from "react";

export function PageContainer({ children }: PropsWithChildren) {
  return (
    <>
      <Header />
      <main className="flex flex-col justify-between py-20 lg:py-2 space-y-32 lg:space-y-16">
        {children}
      </main>
      <Footer />
    </>
  );
}

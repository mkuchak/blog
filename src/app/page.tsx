import Image from "next/image";
import { ThemeToggle } from "~/components/theme-toggle";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-col items-center justify-center">
        <Image
          src="/images/logo.svg"
          alt="Logo"
          width="200"
          height="200"
          className="mb-8"
        />
        <h1 className="text-4xl font-bold text-center">
          Next.js + Tailwind CSS + TypeScript
        </h1>
        <p className="text-xl text-center">with Prettier and ESLint</p>
      </div>
    </main>
  );
}

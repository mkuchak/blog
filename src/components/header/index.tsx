import { SearchIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getRepositories } from "~/components/header/api/get-repositories";
import { Menu } from "~/components/header/menu";
import { ThemeToggle } from "~/components/theme-toggle";
import { Button } from "~/components/ui/button";

export async function Header() {
  const repositories = await getRepositories({ username: "mkuchak" });

  return (
    <header className="fixed backdrop-blur-3xl w-full bg-white/50 dark:bg-gray-950/50 z-10 shadow-sm">
      <div className="container flex items-center justify-between p-4">
        <Link href="/">
          <div className="flex items-center space-x-3">
            <Image src="/logo.png" alt="Logo" width="28" height="28" />
            <h1 className="text-xl font-semibold">kuch.dev</h1>
          </div>
        </Link>

        <Menu projects={repositories} />

        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <SearchIcon className="w-4 h-4 mr-2" />
            Search
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

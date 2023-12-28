import { SearchIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getRepositories } from "~/components/header/api/get-repositories";
import { NavigationMenu } from "~/components/header/navigation-menu";
import { ThemeToggle } from "~/components/theme-toggle";
import { Button } from "~/components/ui/button";

export async function Header() {
  const repositories = await getRepositories({ username: "mkuchak" });

  return (
    <header className="backdrop-blur-3xl">
      <div className="container flex items-center justify-between p-6">
        <Link href="/">
          <div className="flex items-center space-x-3">
            <Image src="/logo.png" alt="Logo" width="28" height="28" />
            <h1 className="text-xl font-semibold">kuch.dev</h1>
          </div>
        </Link>

        <NavigationMenu projects={repositories} />

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

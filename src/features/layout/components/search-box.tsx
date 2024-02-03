import { Button } from "@/components/ui/button";
import { SearchIcon, XIcon } from "lucide-react";
import Link from "next/link";

export function SearchBox({
  isOpen,
  toggleSearchBar,
}: {
  isOpen: boolean;
  toggleSearchBar: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 w-full h-full z-50 bg-black/10 backdrop-blur-sm flex justify-center items-start pt-32 xs:pt-16"
      onClick={toggleSearchBar}
    >
      <div
        className="flex flex-col items-center justify-start shadow-lg w-full max-w-[540px] mx-4 rounded-lg bg-[#ffffff] dark:bg-[#1a1a1f]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-start h-[72px] w-full mx-4 space-x-4 p-6 xxs:p-2 rounded-t-lg shadow-md">
          <label htmlFor="search" className="ml-2">
            <SearchIcon
              strokeWidth={3}
              className="w-5 h-5 text-[#1b202b] dark:text-[#f0f0f0]"
            />
          </label>
          <input
            id="search"
            className="w-full h-full text-[1.25rem] xxs:text-[1.125rem] !mr-4 sm:!mr-0 font-medium text-[#1b202b] dark:text-[#1b202b] placeholder:text-[#1b202b] dark:placeholder:text-[#9ca3af] bg-transparent"
            placeholder="Search posts..."
            autoFocus
          />
          <Button
            variant="ghost"
            size="icon"
            className="items-center justify-center hover:bg-transparent hidden sm:flex !mr-1"
            onClick={toggleSearchBar}
          >
            <XIcon strokeWidth={3} className="w-5 h-5 text-[#1b202b] dark:text-[#f0f0f0]" />
          </Button>
        </div>
        <div className="flex flex-col items-start w-full overflow-auto max-h-[32rem] xs:max-h-[28rem] last:rounded-b-lg">
          <div className="flex items-center p-6 h-[72px] border-t w-full">
            <h4 className="text-[1.125rem] xxs:text-[1rem] text-[#252629] dark:text-[#f0f0f0] font-medium">
              No results found...
            </h4>
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <Link href="/blog" className="w-full" key={i}>
              <div className="flex flex-col items-start justify-center p-6 xxs:py-12 h-[72px] border-t border-[#eaeaea] dark:border-[#252629] w-full hover:bg-[#f3f1f3] dark:hover:bg-[#1f1f25]">
                <time className="text-[0.8125rem] text-[#51586a] dark:text-[#9e9e9e]">
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <div className="font-bold text-[1.125rem] xxs:text-[1rem] text-[#252629] dark:text-[#f0f0f0]">
                  React Hooks: useEffect
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

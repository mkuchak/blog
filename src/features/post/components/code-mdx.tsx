import { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function CodeMDX({
  children,
  className,
  ...props
}: ComponentProps<"code">) {
  return (
    <code
      {...props}
      className={cn(
        "rounded-md px-[0.4em] py-[0.2em] font-normal before:content-[''] after:content-['']",
        "bg-slate-100 text-[#51586a] dark:bg-zinc-800 dark:text-[#ffffff]",
        className
      )}
    >
      {children}
    </code>
  );
}

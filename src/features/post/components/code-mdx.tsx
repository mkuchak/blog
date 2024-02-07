import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

export function CodeMDX({
  children,
  className,
  ...props
}: ComponentProps<"code">) {
  return (
    <code
      {...props}
      className={cn(
        "before:content-[''] after:content-[''] font-normal px-[0.4em] py-[0.2em] rounded-md",
        "bg-slate-100 text-[#51586a] dark:bg-zinc-800 dark:text-[#ffffff]",
        className
      )}
    >
      {children}
    </code>
  );
}

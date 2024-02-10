import { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function TableMDX({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="grid">
      <table className={cn("grid overflow-x-auto", className)} {...props} />
    </div>
  );
}

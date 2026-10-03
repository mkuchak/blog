import { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function TableMDX({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="grid">
      <div className="grid overflow-x-auto">
        <table className={cn("my-0", className)} {...props} />
      </div>
    </div>
  );
}

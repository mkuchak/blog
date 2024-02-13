import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "flex items-center justify-center gap-x-2 rounded-full bg-[#f3f1f3] hover:bg-[#e7e7eb] dark:bg-[#1a1a1f] dark:hover:bg-[#1f1f25] dark:lg:bg-[#252629]",
        secondary:
          "flex items-center justify-center gap-x-2 rounded-full bg-[#1b202b] text-base font-medium text-[#ffffff] hover:bg-[#0056ff] hover:text-[#ffffff] dark:bg-[#6029ff] dark:hover:bg-[#4d21cb]",
        social:
          "group flex !size-[3.125rem] items-center justify-center rounded-full bg-[#fff] shadow-md transition duration-300 hover:-translate-y-1 dark:bg-[#1a1a1f] xs:size-[2.5rem]",
        outline:
          "flex !h-[2.375rem] items-center justify-center gap-x-3 whitespace-nowrap rounded-full border border-[#eaeaea] bg-background px-[1.125rem] py-2 text-sm font-medium text-[#1b202b] transition duration-300 hover:scale-105 dark:border-[#252629] dark:text-[#f0f0f0]",
        rousing:
          "group flex items-center justify-center gap-x-2 rounded-full border border-[#eaeaea] bg-background px-4 py-5 text-base hover:bg-background dark:border-[#252629] lg:mt-6",
        ghost:
          "group flex items-center justify-center gap-x-2 text-xl font-medium",
        link: "!px-0 text-base font-medium transition hover:text-[#fdbc16]",
      },
      size: {
        default: "h-10 px-5 py-2 lg:px-4",
        sm: "h-8 px-[1.125rem] py-[0.425rem] text-sm",
        lg: "h-[3.75rem] px-8",
        icon: "size-10 gap-x-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

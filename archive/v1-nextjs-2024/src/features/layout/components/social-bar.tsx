import Link from "next/link";
import { ComponentProps } from "react";

import { Icon } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import { social } from "@/constants/social";
import { cn } from "@/lib/utils";

export function SocialBar({ className, ...props }: ComponentProps<"ul">) {
  return (
    <ul className={cn("flex space-x-2", className)} {...props}>
      {social.map((social) => (
        <li key={social.name}>
          <Button variant="social" size="icon" asChild>
            <Link href={social.url} target="_blank" rel="noreferrer">
              <span className="flex !size-8 items-center justify-center rounded-full bg-[#1b202b] transition duration-300 group-hover:bg-[#0056ff] dark:bg-[#6029ff] dark:group-hover:bg-[#4d21cb] xs:size-[1.75rem]">
                <Icon
                  name={social.icon}
                  className="size-4 fill-current text-[#f3f1f3]"
                />
              </span>
            </Link>
          </Button>
        </li>
      ))}
    </ul>
  );
}

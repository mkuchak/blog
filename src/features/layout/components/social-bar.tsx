import { Icon } from "@/components/icons/icon";
import { social } from "@/constants/social";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ComponentProps } from "react";

export function SocialBar({ className, ...props }: ComponentProps<"ul">) {
  return (
    <ul className={cn("flex space-x-2", className)} {...props}>
      {social.map((social) => (
        <Link
          href={social.url}
          target="_blank"
          rel="noreferrer"
          key={social.name}
        >
          <li className="flex items-center justify-center rounded-full shadow-md bg-[#fff] dark:bg-[#1a1a1f] h-[3.125rem] w-[3.125rem] xs:h-[2.5rem] xs:w-[2.5rem] hover:-translate-y-1 transition duration-300 group">
            <span className="flex items-center justify-center h-8 w-8 xs:h-[1.75rem] xs:w-[1.75rem] rounded-full bg-[#1b202b] group-hover:bg-[#0056ff] dark:bg-[#6029ff] dark:group-hover:bg-[#4d21cb] transition duration-300">
              <Icon
                name={social.icon}
                className="fill-current text-[#f3f1f3] w-4 h-4"
              />
            </span>
          </li>
        </Link>
      ))}
    </ul>
  );
}

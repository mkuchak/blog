import { Icon } from "@/components/icons/icon";
import { social } from "@/constants/social";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function SocialBar() {
  return (
    <ul className="flex space-x-2">
      {social.map((social) => (
        <Link
          href={social.url}
          target="_blank"
          rel="noreferrer"
          key={social.name}
        >
          <li className="flex items-center justify-center rounded-full shadow-md bg-[#fff] dark:bg-[#1a1a1f] h-[3.125rem] w-[3.125rem] hover:-translate-y-1 transition duration-300 group">
            <span className="flex items-center justify-center h-8 w-8 rounded-full bg-[#1b202b] group-hover:bg-[#0056ff] dark:bg-[#6029ff] dark:group-hover:bg-[#4d21cb] transition duration-300">
              <Icon name={social.icon} className="fill-current text-[#f3f1f3] w-4 h-4" />
            </span>
          </li>
        </Link>
      ))}
    </ul>
  );
}

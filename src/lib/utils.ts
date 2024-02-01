import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function findFirstImageInMarkdown(
  markdownString: string
): string | null {
  const imageRegex = /!\[.*?\]\((.*?\.(?:jpg|jpeg|png|gif|bmp))\)/i;
  const match = markdownString.match(imageRegex);

  return match ? match[1] : null;
}

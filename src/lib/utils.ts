import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shuffle(array: string[]) {
  return array.sort(() => Math.random() - 0.5);
}

export function extractMetadataFromMarkdown(
  markdown: string
): Record<string, string> {
  const charactersBetweenGroupedHyphens = /^---([\s\S]*?)---/;
  const metadataMatched = markdown.match(charactersBetweenGroupedHyphens);

  if (!metadataMatched) {
    return {};
  }

  const metadata = metadataMatched[1];

  if (!metadata) {
    return {};
  }

  const metadataLines = metadata.split("\n");
  const metadataObject = metadataLines.reduce((accumulator, line) => {
    const [key, ...value] = line.split(":").map((part) => part.trim());

    if (key) {
      accumulator[key] = value[1] ? value.join(":") : value.join("");
    }
    return accumulator;
  }, {} as Record<string, string>);

  return metadataObject;
}

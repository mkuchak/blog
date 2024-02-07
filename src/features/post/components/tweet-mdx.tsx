import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import { Tweet, TweetProps } from "react-tweet";

export function TweetMDX({
  className,
  ...props
}: TweetProps & { className?: ClassValue }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Tweet {...props} />
    </div>
  );
}

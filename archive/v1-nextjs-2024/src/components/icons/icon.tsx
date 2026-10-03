import dynamic from "next/dynamic";
import { ComponentProps } from "react";

const icons = {
  InstagramIcon: dynamic(() => import("./instagram")),
  XIcon: dynamic(() => import("./x")),
  GithubIcon: dynamic(() => import("./github")),
  LinkedinIcon: dynamic(() => import("./linkedin")),
  FacebookIcon: dynamic(() => import("./facebook")),
  YoutubeIcon: dynamic(() => import("./youtube")),
  TwitchIcon: dynamic(() => import("./twitch")),
  TiktokIcon: dynamic(() => import("./tiktok")),
  DiscordIcon: dynamic(() => import("./discord")),
};

type IconNames = keyof typeof icons;

type IconProps = {
  name: IconNames;
} & ComponentProps<"svg">;

export const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  const DynamicIcon = icons[name];
  return <DynamicIcon {...props} />;
};

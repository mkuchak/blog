import dynamic from "next/dynamic";
import { ComponentProps } from "react";

const Icon = {
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

type IconNames = keyof typeof Icon;

type SocialIconProps = {
  name: IconNames;
} & ComponentProps<"svg">;

export const SocialIcon: React.FC<SocialIconProps> = ({ name, ...props }) => {
  const DynamicComponent = Icon[name];
  return <DynamicComponent {...props} />;
};

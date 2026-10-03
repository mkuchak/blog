export type Social = {
  name: string;
  url: string;
  icon:
    | "InstagramIcon"
    | "XIcon"
    | "GithubIcon"
    | "LinkedinIcon"
    | "FacebookIcon"
    | "YoutubeIcon"
    | "TwitchIcon"
    | "TiktokIcon"
    | "DiscordIcon";
}[];

export const social: Social = [
  {
    name: "Instagram",
    url: "https://instagram.com/marcoskuchak",
    icon: "InstagramIcon" as const,
  },
  {
    name: "X",
    url: "https://x.com/marcoskuchak",
    icon: "XIcon" as const,
  },
  {
    name: "GitHub",
    url: "https://github.com/mkuchak",
    icon: "GithubIcon" as const,
  },
  {
    name: "LinkedIn",
    url: "https://linkedin.com/in/mkuchak",
    icon: "LinkedinIcon" as const,
  },
];

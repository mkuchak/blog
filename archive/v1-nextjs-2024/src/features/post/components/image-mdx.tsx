import NextImage from "next/image";
import { ComponentProps } from "react";

export function ImageMDX({
  src,
  alt,
}: ComponentProps<"img"> & {
  src: string;
  alt: string;
}) {
  let widthFromSrc, heightFromSrc;
  const url = new URL(src, "https://kuch.dev");
  const widthParam = url.searchParams.get("w") || url.searchParams.get("width");
  const heightParam =
    url.searchParams.get("h") || url.searchParams.get("height");
  if (widthParam) {
    widthFromSrc = parseInt(widthParam);
  }
  if (heightParam) {
    heightFromSrc = parseInt(heightParam);
  }

  const imageProps = {
    src,
    alt,
    height: heightFromSrc || 1024,
    width: widthFromSrc || 576,
  };

  return <NextImage {...imageProps} />;
}

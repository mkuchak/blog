/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "placehold.co",
      },
      {
        hostname: "github.com",
      },
      {
        hostname: "user-images.githubusercontent.com",
      },
      {
        hostname: "upload.wikimedia.org",
      },
      {
        hostname: "icons.veryicon.com",
      },
    ],
  },
  reactStrictMode: false, // TODO: enable this
};

export default nextConfig;

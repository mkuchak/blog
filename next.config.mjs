/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
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
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Article cover images are served from the ReactDays CDN. Allow any HTTPS
    // host here for the demo; in production, restrict to your CDN hostnames.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;

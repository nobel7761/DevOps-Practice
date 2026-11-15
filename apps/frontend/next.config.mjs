/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["192.168.0.102"],
  // In production the backend lives on another domain; proxying /api through
  // this origin keeps the httpOnly auth cookie first-party so src/proxy.ts sees it.
  async rewrites() {
    if (!process.env.BACKEND_URL) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

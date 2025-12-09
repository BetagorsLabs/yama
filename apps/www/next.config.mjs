/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  async redirects() {
    return [
      {
        source: "/docs",
        destination: "https://docs.yamajs.org",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;


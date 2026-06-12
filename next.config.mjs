/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xxwzufdezpyabqkwrcbz.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // ensure MDX content ships with the (now dynamic) serverless functions
  experimental: {
    outputFileTracingIncludes: {
      "/**": ["./content/**/*"],
    },
  },
};

export default nextConfig;

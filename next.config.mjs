/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: false,
    async headers() {
        return [
            {
                source: "/api/auth/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS, PUT, DELETE" },
                    { key: "Access-Control-Allow-Headers", value: "Authorization, Content-Type" },
                  ],
            },
        ];
    },
    images: {
        remotePatterns: [
            { hostname: "pbs.twimg.com" },
        ],
    },
    env: {
        DAILY_POOL: process.env.DAILY_POOL,
    },
};

export default nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true, // 确保启用了 `app/` 目录
  }
};

module.exports = nextConfig;

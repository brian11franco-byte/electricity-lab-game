/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Using the static public folder, so remote patterns are not needed.
    // Formats tuned for lightweight delivery on school Wi-Fi.
    formats: ["image/webp"],
  },
};

module.exports = nextConfig;

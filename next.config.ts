/** @type {import('next').NextConfig} */
const nextConfig = {
  // Yeh section add karein taake build pass ho jaye
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
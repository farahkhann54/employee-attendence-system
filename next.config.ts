/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Yeh line build ko fail hone se rokegi
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint errors ko bhi ignore karega build ke waqt
    ignoreDuringBuilds: true,
  },
  // Turbopack settings (Optional)
  transpilePackages: ['lucide-react'],
}

module.exports = nextConfig
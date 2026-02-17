/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Permite imagens locais do diretório de uploads
    remotePatterns: [],
  },
  // Configuração para lidar com uploads de arquivos maiores
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
};

module.exports = nextConfig;

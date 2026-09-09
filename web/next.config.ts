import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Build enxuta pro Docker: só o necessário de node_modules vai pra imagem final.
  output: 'standalone',
  experimental: {
    serverActions: {
      // Padrão do Next é 1MB — pequeno demais pra imagens da Galeria (data
      // URI em base64 infla o binário original em ~33%). 10MB dá folga pra
      // fotos reais, alinhado com o limite de 5MB por imagem validado na api.
      bodySizeLimit: '10mb',
    },
  },
}

export default nextConfig

// ============================================================
// Utilitário de Upload e Compressão de Fotos
// ============================================================
// Recebe uma imagem, comprime usando 'sharp' e salva no
// Vercel Blob Storage.
// ============================================================

import sharp from 'sharp';
import { put, del } from '@vercel/blob';
import { randomUUID } from 'crypto';

// Configurações de compressão por tipo
const CONFIG = {
  qualificacao: {
    width: 800,
    height: 800,
    quality: 70,
    pasta: 'qualificacoes',
  },
  perfil: {
    width: 400,
    height: 400,
    quality: 75,
    pasta: 'perfis',
  },
};

/**
 * Comprime e salva a imagem no Vercel Blob Storage.
 *
 * @param arquivo - O arquivo como Buffer ou ArrayBuffer
 * @param tipo - 'qualificacao' ou 'perfil'
 * @returns A URL pública da imagem
 */
export async function salvarImagem(
  arquivo: Buffer | ArrayBuffer,
  tipo: 'qualificacao' | 'perfil'
): Promise<string> {
  const config = CONFIG[tipo];

  // Converte para Buffer se necessário
  const buffer = Buffer.isBuffer(arquivo) ? arquivo : Buffer.from(arquivo);

  // Comprime a imagem usando sharp
  const imagemComprimida = await sharp(buffer)
    .resize(config.width, config.height, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({
      quality: config.quality,
      mozjpeg: true,
    })
    .toBuffer();

  // Gera um nome único
  const nomeArquivo = `${config.pasta}/${randomUUID()}.jpg`;

  // Salva no Vercel Blob
  const blob = await put(nomeArquivo, imagemComprimida, {
    access: 'public',
    contentType: 'image/jpeg',
  });

  // Retorna a URL pública
  return blob.url;
}

/**
 * Exclui uma imagem do Vercel Blob.
 *
 * @param url - A URL pública da imagem
 */
export async function excluirImagem(url: string): Promise<void> {
  try {
    await del(url);
  } catch {
    console.warn(`Aviso: erro ao excluir imagem: ${url}`);
  }
}

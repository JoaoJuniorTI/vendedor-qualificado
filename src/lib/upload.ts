// ============================================================
// Utilitário de Upload de Fotos
// ============================================================
// Recebe uma imagem e salva diretamente no Vercel Blob Storage.
// A compressão é feita no frontend (canvas) antes do envio.
// ============================================================

import { put, del } from '@vercel/blob';
import { randomUUID } from 'crypto';

const PASTAS = {
  qualificacao: 'qualificacoes',
  perfil: 'perfis',
};

/**
 * Salva a imagem no Vercel Blob Storage.
 *
 * @param arquivo - O arquivo como Buffer ou ArrayBuffer
 * @param tipo - 'qualificacao' ou 'perfil'
 * @param contentType - Tipo MIME da imagem (ex: 'image/jpeg')
 * @returns A URL pública da imagem
 */
export async function salvarImagem(
  arquivo: Buffer | ArrayBuffer,
  tipo: 'qualificacao' | 'perfil',
  contentType: string = 'image/jpeg'
): Promise<string> {
  const pasta = PASTAS[tipo];

  // Converte para Buffer se necessário
  const buffer = Buffer.isBuffer(arquivo) ? arquivo : Buffer.from(arquivo);

  // Determina a extensão pelo content type
  const extensao = contentType.includes('png') ? 'png' : 'jpg';

  // Gera um nome único
  const nomeArquivo = `${pasta}/${randomUUID()}.${extensao}`;

  // Salva no Vercel Blob
  const blob = await put(nomeArquivo, buffer, {
    access: 'public',
    contentType,
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

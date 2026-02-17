// ============================================================
// Utilitário de Upload e Compressão de Fotos
// ============================================================
// Recebe uma imagem, comprime usando a lib 'sharp' para
// reduzir o tamanho, e salva no diretório de uploads.
// ============================================================

import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';

// Diretórios de upload
const UPLOAD_DIR_QUALIFICACOES = path.join(process.cwd(), 'public', 'uploads', 'qualificacoes');
const UPLOAD_DIR_PERFIS = path.join(process.cwd(), 'public', 'uploads', 'perfis');

// Configurações de compressão
const CONFIG = {
  qualificacao: {
    width: 800,       // Largura máxima em pixels
    height: 800,      // Altura máxima em pixels
    quality: 70,      // Qualidade JPEG (0-100)
    dir: UPLOAD_DIR_QUALIFICACOES,
    urlPrefix: '/uploads/qualificacoes',
  },
  perfil: {
    width: 400,       // Foto de perfil menor
    height: 400,
    quality: 75,
    dir: UPLOAD_DIR_PERFIS,
    urlPrefix: '/uploads/perfis',
  },
};

/**
 * Garante que o diretório de upload existe.
 * Se não existir, cria automaticamente.
 */
async function garantirDiretorio(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

/**
 * Salva e comprime uma imagem.
 * 
 * @param arquivo - O arquivo como Buffer ou ArrayBuffer
 * @param tipo - 'qualificacao' ou 'perfil'
 * @returns A URL pública da imagem salva (ex: /uploads/qualificacoes/abc123.jpg)
 */
export async function salvarImagem(
  arquivo: Buffer | ArrayBuffer,
  tipo: 'qualificacao' | 'perfil'
): Promise<string> {
  const config = CONFIG[tipo];
  
  // Garante que o diretório existe
  await garantirDiretorio(config.dir);

  // Gera um nome único para o arquivo
  const nomeArquivo = `${randomUUID()}.jpg`;
  const caminhoCompleto = path.join(config.dir, nomeArquivo);

  // Converte para Buffer se necessário
  const buffer = Buffer.isBuffer(arquivo) ? arquivo : Buffer.from(arquivo);

  // Comprime a imagem usando sharp:
  // - Redimensiona para o tamanho máximo (mantendo proporção)
  // - Converte para JPEG
  // - Aplica a qualidade definida
  await sharp(buffer)
    .resize(config.width, config.height, {
      fit: 'inside',           // Mantém a proporção original
      withoutEnlargement: true, // Não amplia imagens menores
    })
    .jpeg({
      quality: config.quality,
      mozjpeg: true,  // Usa mozjpeg para melhor compressão
    })
    .toFile(caminhoCompleto);

  // Retorna a URL pública
  return `${config.urlPrefix}/${nomeArquivo}`;
}

/**
 * Exclui uma imagem do disco.
 * 
 * @param url - A URL pública da imagem (ex: /uploads/qualificacoes/abc123.jpg)
 */
export async function excluirImagem(url: string): Promise<void> {
  try {
    const caminhoCompleto = path.join(process.cwd(), 'public', url);
    await fs.unlink(caminhoCompleto);
  } catch {
    // Se o arquivo não existe, ignora silenciosamente
    console.warn(`Aviso: imagem não encontrada para exclusão: ${url}`);
  }
}

// ============================================================
// API: Upload de Imagem
// ============================================================
// POST /api/upload
//
// Recebe uma imagem via FormData, comprime e salva no disco.
// Retorna a URL pública da imagem salva.
//
// Parâmetros do FormData:
//   - arquivo: o arquivo de imagem
//   - tipo: 'qualificacao' ou 'perfil'
//
// Requer autenticação (apenas admins podem fazer upload).
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { salvarImagem } from '@/lib/upload';

export async function POST(request: NextRequest) {
  // Verifica se está autenticado
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { erro: 'Não autenticado' },
      { status: 401 }
    );
  }

  try {
    // Lê o FormData da requisição
    const formData = await request.formData();
    const arquivo = formData.get('arquivo') as File | null;
    const tipo = formData.get('tipo') as 'qualificacao' | 'perfil' | null;

    // Validações
    if (!arquivo) {
      return NextResponse.json(
        { erro: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    if (!tipo || !['qualificacao', 'perfil'].includes(tipo)) {
      return NextResponse.json(
        { erro: 'Tipo deve ser "qualificacao" ou "perfil"' },
        { status: 400 }
      );
    }

    // Verifica se é uma imagem
    if (!arquivo.type.startsWith('image/')) {
      return NextResponse.json(
        { erro: 'O arquivo deve ser uma imagem (JPG, PNG, etc.)' },
        { status: 400 }
      );
    }

    // Limite de 5MB
    const LIMITE_5MB = 5 * 1024 * 1024;
    if (arquivo.size > LIMITE_5MB) {
      return NextResponse.json(
        { erro: 'A imagem deve ter no máximo 5MB' },
        { status: 400 }
      );
    }

    // Converte o File para Buffer
    const bytes = await arquivo.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Salva a imagem no Vercel Blob
    const url = await salvarImagem(buffer, tipo, arquivo.type);

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('Erro no upload:', error);
    return NextResponse.json(
      { erro: 'Erro ao processar a imagem', detalhe: error.message || String(error) },
      { status: 500 }
    );
  }
}

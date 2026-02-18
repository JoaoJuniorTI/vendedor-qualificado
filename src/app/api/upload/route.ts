// ============================================================
// API: Upload de Imagem
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { put } from '@vercel/blob';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  // Passo 1: Verifica autenticação
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { erro: 'Erro na autenticação', detalhe: error.message },
      { status: 500 }
    );
  }

  // Passo 2: Lê o FormData
  let arquivo: File;
  let tipo: string;
  try {
    const formData = await request.formData();
    arquivo = formData.get('arquivo') as File;
    tipo = formData.get('tipo') as string;

    if (!arquivo) {
      return NextResponse.json({ erro: 'Nenhum arquivo enviado' }, { status: 400 });
    }
    if (!tipo || !['qualificacao', 'perfil'].includes(tipo)) {
      return NextResponse.json({ erro: 'Tipo inválido' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { erro: 'Erro ao ler FormData', detalhe: error.message },
      { status: 500 }
    );
  }

  // Passo 3: Valida o arquivo
  if (!arquivo.type.startsWith('image/')) {
    return NextResponse.json({ erro: 'O arquivo deve ser uma imagem' }, { status: 400 });
  }
  if (arquivo.size > 5 * 1024 * 1024) {
    return NextResponse.json({ erro: 'Máximo 5MB' }, { status: 400 });
  }

  // Passo 4: Converte para Buffer
  let buffer: Buffer;
  try {
    const bytes = await arquivo.arrayBuffer();
    buffer = Buffer.from(bytes);
  } catch (error: any) {
    return NextResponse.json(
      { erro: 'Erro ao converter arquivo', detalhe: error.message },
      { status: 500 }
    );
  }

  // Passo 5: Salva no Vercel Blob
  try {
    const pasta = tipo === 'perfil' ? 'perfis' : 'qualificacoes';
    const extensao = arquivo.type.includes('png') ? 'png' : 'jpg';
    const nomeArquivo = `${pasta}/${randomUUID()}.${extensao}`;

    const blob = await put(nomeArquivo, buffer, {
      access: 'public',
      contentType: arquivo.type,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error: any) {
    return NextResponse.json(
      { erro: 'Erro ao salvar no Blob Storage', detalhe: error.message },
      { status: 500 }
    );
  }
}

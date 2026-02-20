// ============================================================
// API: Destaques
// ============================================================
// GET  /api/destaques         → Listar destaques ativos (público)
// POST /api/destaques         → Criar destaque (super admin)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET: Listar destaques ativos (público)
export async function GET() {
  try {
    const destaques = await prisma.destaque.findMany({
      where: { ativo: true },
      orderBy: { posicao: 'asc' },
      select: {
        id: true,
        posicao: true,
        titulo: true,
        imagemUrl: true,
        linkUrl: true,
      },
    });

    return NextResponse.json({ destaques });
  } catch (error: any) {
    return NextResponse.json(
      { erro: 'Erro ao carregar destaques', detalhe: error.message },
      { status: 500 }
    );
  }
}

// POST: Criar destaque (apenas super admin)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 });
  }
  if ((session.user as any).papel !== 'SUPER_ADMIN') {
    return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 });
  }

  try {
    const { posicao, titulo, imagemUrl, linkUrl } = await request.json();

    if (!posicao || !titulo || !imagemUrl || !linkUrl) {
      return NextResponse.json(
        { erro: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    if (!['ESQUERDA', 'DIREITA'].includes(posicao)) {
      return NextResponse.json(
        { erro: 'Posição deve ser ESQUERDA ou DIREITA' },
        { status: 400 }
      );
    }

    // Desativa destaques anteriores na mesma posição
    await prisma.destaque.updateMany({
      where: { posicao, ativo: true },
      data: { ativo: false },
    });

    const destaque = await prisma.destaque.create({
      data: {
        posicao,
        titulo: titulo.trim(),
        imagemUrl,
        linkUrl: linkUrl.trim(),
      },
    });

    return NextResponse.json({ sucesso: true, destaque }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { erro: 'Erro ao criar destaque', detalhe: error.message },
      { status: 500 }
    );
  }
}
